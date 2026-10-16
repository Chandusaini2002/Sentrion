import os
import subprocess
import sys
from sqlalchemy import create_engine, text
from cryptography.fernet import Fernet

def migrate(path, revision):
    env = os.environ | {'DATABASE_URL': 'sqlite:///' + str(path)}
    return subprocess.run([sys.executable, '-m', 'alembic', 'upgrade', revision], env=env, capture_output=True, text=True)

def test_upgrade_preserves_existing_data_and_encrypts(tmp_path):
    path=tmp_path/'upgrade.db'
    result=migrate(path,'0001_baseline')
    assert result.returncode == 0, result.stderr
    engine=create_engine('sqlite:///'+str(path))
    with engine.begin() as db:
        db.execute(text("INSERT INTO users (id,email,hashed_password,account_status) VALUES ('00000000000000000000000000000001','Alice@Example.com','existing-hash','active')"))
        db.execute(text("INSERT INTO cameras (id,owner_id,name,connection_type,rtsp_url,username,password) VALUES ('00000000000000000000000000000002','00000000000000000000000000000001','Old camera','rtsp','rtsp://user:secret@192.0.2.1/stream','user','secret')"))
    result=migrate(path,'head')
    assert result.returncode == 0, result.stderr
    with engine.connect() as db:
        assert db.execute(text('SELECT email,hashed_password FROM users')).one() == ('alice@example.com','existing-hash')
        password=db.execute(text('SELECT password FROM cameras')).scalar_one()
        assert password != 'secret'
        assert Fernet(os.environ['CAMERA_ENCRYPTION_KEY'].encode()).decrypt(password.encode()) == b'secret'
    assert migrate(path,'head').returncode == 0

def test_conflicting_legacy_accounts_fail_without_deleting(tmp_path):
    path=tmp_path/'collision.db'
    assert migrate(path,'0001_baseline').returncode == 0
    engine=create_engine('sqlite:///'+str(path))
    with engine.begin() as db:
        for id,email in [('1'*32,'Alice@example.com'),('2'*32,'alice@example.com')]:
            db.execute(text('INSERT INTO users (id,email,hashed_password) VALUES (:id,:email,:password)'),{'id':id,'email':email,'password':'existing'})
    assert migrate(path,'head').returncode != 0
    with engine.connect() as db:
        assert db.execute(text('SELECT count(*) FROM users')).scalar_one() == 2

def test_adoption_requires_matching_unversioned_schema(tmp_path):
    path=tmp_path/'adopt.db'
    assert migrate(path,'0001_baseline').returncode == 0
    engine=create_engine('sqlite:///'+str(path))
    with engine.begin() as db:
        db.execute(text('DELETE FROM alembic_version'))
    env=os.environ | {'DATABASE_URL':'sqlite:///'+str(path)}
    result=subprocess.run([sys.executable,'-m','scripts.adopt_existing_schema'],env=env,capture_output=True,text=True)
    assert result.returncode == 0, result.stderr
    with engine.connect() as db:
        assert db.execute(text('SELECT version_num FROM alembic_version')).scalar_one() == '0001_baseline'
    result=subprocess.run([sys.executable,'-m','scripts.adopt_existing_schema'],env=env,capture_output=True,text=True)
    assert result.returncode != 0
