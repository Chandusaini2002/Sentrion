import os
import uuid
from datetime import datetime, timedelta, timezone
os.environ.setdefault('DATABASE_URL', 'sqlite://')
os.environ.setdefault('SECRET_KEY', 'test-secret-only-' + 'x' * 48)
os.environ.setdefault("CAMERA_ENCRYPTION_KEY", "MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=")
import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base
from app.core.config import settings
from app.dependencies.db import get_db
from app.models.user import User
from app.models.enums import AccountStatus

@pytest.fixture
def setup():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)
    def override():
        with session() as db:
            yield db
    app.dependency_overrides[get_db] = override
    with TestClient(app) as client:
        yield client, session
    app.dependency_overrides.clear()
    engine.dispose()

def account(client, name):
    email = f'{name}@example.com'
    response = client.post('/api/auth/signup', json={'email':email, 'password':'password123', 'full_name':name})
    assert response.status_code == 201, response.text
    user = response.json()
    response = client.post('/api/auth/login', json={'email':email, 'password':'password123'})
    assert response.status_code == 200, response.text
    return user, {'Authorization':'Bearer ' + response.json()['access_token']}

def test_signup_login_validation_and_empty_dashboard(setup):
    c, session = setup
    user, headers = account(c, 'alice')
    assert c.get('/api/auth/me', headers=headers).json()['user_id'] == user['user_id']
    assert c.get('/api/profile/me', headers=headers).status_code == 200
    duplicate = c.post('/api/auth/signup', json={'email':' ALICE@EXAMPLE.COM ', 'password':'password123', 'full_name':'A'})
    assert duplicate.status_code == 409
    assert c.post('/api/auth/login', json={'email':' ALICE@EXAMPLE.COM ', 'password':'password123'}).status_code == 200
    for payload in [{'email':'bad','password':'abc!','full_name':'A'}, {'email':'new@example.com','password':'秘密'*30,'full_name':'A'}, {'email':'new@example.com','password':'password123','full_name':'   '}]:
        res = c.post('/api/auth/signup', json=payload)
        assert res.status_code == 422
        assert payload['password'] not in res.text
    for email, password in [('alice@example.com','wrong'),('missing@example.com','wrong')]:
        assert c.post('/api/auth/login', json={'email':email, 'password':password}).json()['detail'] == 'Incorrect email or password.'
    summary = c.get('/api/dashboard/summary', headers=headers).json()
    assert all(value == 0 for key,value in summary.items() if key != 'user_id')
    with session() as db:
        saved = db.get(User, uuid.UUID(user['user_id']))
        assert saved.hashed_password != 'password123'
    assert 'password' not in str(user)

@pytest.mark.parametrize('path', ['/auth/me','/users/me','/profile/me','/cameras','/alerts','/activity','/notifications','/security-events','/dashboard/summary'])
def test_protected_endpoints(setup, path):
    c,_ = setup
    for headers in [{},{'Authorization':'Bearer invalid'}]:
        res = c.get('/api'+path, headers=headers)
        assert res.status_code == 401
        assert res.headers['www-authenticate'] == 'Bearer'

def test_token_expiration_tampering_and_inactive_users(setup):
    c,session = setup
    user,headers = account(c,'alice')
    now = datetime.now(timezone.utc)
    for changes in [{'exp':now-timedelta(seconds=1)}, {'sub':'invalid'}, {'type':'refresh'}]:
        claims = {'sub':user['user_id'], 'iat':now, 'exp':now+timedelta(hours=1), 'type':'access'} | changes
        token = jwt.encode(claims, settings.SECRET_KEY, algorithm='HS256')
        assert c.get('/api/auth/me',headers={'Authorization':'Bearer '+token}).status_code == 401
    token = jwt.encode({'sub':user['user_id'],'exp':now+timedelta(hours=1)},'wrong-secret-'+'x'*32,algorithm='HS256')
    assert c.get('/api/auth/me',headers={'Authorization':'Bearer '+token}).status_code == 401
    with session() as db:
        db.get(User,uuid.UUID(user['user_id'])).account_status = AccountStatus.suspended
        db.commit()
    assert c.get('/api/auth/me',headers=headers).status_code == 401
    assert c.post('/api/auth/login',json={'email':'alice@example.com','password':'password123'}).status_code == 401

def test_all_resource_ownership_and_foreign_camera_links(setup):
    c,_ = setup
    a,ha = account(c,'alice'); b,hb = account(c,'bob')
    response = c.post('/api/cameras',headers=ha,json={'name':'A camera','rtsp_url':'rtsp://192.0.2.1/stream','user_id':b['user_id']})
    assert response.status_code == 201, response.text
    camera = response.json(); cid=camera['id']
    assert camera['owner_id'] == a['user_id']
    assert camera['status'] == 'offline'
    for method, suffix, data in [('get','',None),('patch','',{'name':'stolen'}),('delete','',None)]:
        assert c.request(method,'/api/cameras/'+cid+suffix,headers=hb,json=data).status_code == 404
    timestamp=datetime.now(timezone.utc).isoformat()
    resources = {
        'alerts':{'type':'Alert','severity':'high','occurred_at':timestamp},
        'security-events':{'event_type':'Event','severity':'medium','occurred_at':timestamp},
        'activity':{'type':'camera_connected','title':'Activity','description':'Details','occurred_at':timestamp},
        'notifications':{'title':'Notice','message':'Details'},
    }
    ids={}
    for resource,body in resources.items():
        if resource != 'notifications':
            rejected=c.post('/api/'+resource,headers=hb,json=body|{'camera_id':cid})
            assert rejected.status_code == 404, rejected.text
            body=body|{'camera_id':cid}
        created=c.post('/api/'+resource,headers=ha,json=body|{'user_id':b['user_id']})
        assert created.status_code == 201, created.text
        ids[resource]=created.json()['id']
        assert created.json()['owner_id'] == a['user_id']
    for resource in ['cameras',*resources]:
        assert c.get('/api/'+resource+'?user_id='+a['user_id'],headers=hb).json() == []
        assert len(c.get('/api/'+resource,headers=ha).json()) == 1
    for resource in ['alerts','activity','security-events']:
        assert c.get('/api/'+resource+'/'+ids[resource],headers=hb).status_code == 404
    for resource,action in [('alerts','resolve'),('notifications','read')]:
        assert c.patch('/api/'+resource+'/'+ids[resource]+'/'+action,headers=hb).status_code == 404
        assert c.delete('/api/'+resource+'/'+ids[resource],headers=hb).status_code == 404
    for resource in ['users','profile']:
        assert c.get('/api/'+resource+'/'+a['user_id'],headers=hb).status_code in (404,405)
        assert c.patch('/api/'+resource+'/'+a['user_id'],headers=hb,json={'email':'steal@example.com'}).status_code in (404,405)
    assert c.get('/api/users',headers=ha).status_code == 404
    assert c.patch('/api/users/me',headers=ha,json={'email':a['email'],'account_status':'active'}).status_code == 422
    assert c.patch('/api/users/me',headers=ha,json={'email':b['email']}).status_code == 409
    assert c.get('/api/cameras').status_code == 401
    assert len(c.get('/api/cameras',headers=ha).json()) == 1

def test_camera_credentials_encrypted_and_redacted(setup):
    from sqlalchemy import text
    c, session = setup
    _, headers = account(c,'alice')
    secret='UniqueSecret123!'
    res=c.post('/api/cameras',headers=headers,json={'name':'Secret camera','rtsp_url':f'rtsp://user:{secret}@192.0.2.3/live?token={secret}','username':'private-user','password':secret})
    assert res.status_code == 201, res.text
    assert secret not in res.text and 'private-user' not in res.text
    assert res.json()['address'] == '192.0.2.3'
    assert res.json()['has_credentials']
    with session() as db:
        row=db.execute(text('SELECT rtsp_url, username, password FROM cameras')).one()
        assert all(secret not in value and 'private-user' not in value for value in row)
    assert c.get('/api/cameras/'+res.json()['id'],headers=headers).status_code == 200
