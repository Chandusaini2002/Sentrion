"""Case-insensitive account identity and encrypted camera secrets."""
from alembic import op
import sqlalchemy as sa
from app.core.encryption import cipher
revision = '0002_auth_security'
down_revision = '0001_baseline'
branch_labels = None
depends_on = None

def upgrade():
    db = op.get_bind()
    collision = db.execute(sa.text("SELECT lower(trim(email)) FROM users GROUP BY lower(trim(email)) HAVING count(*) > 1")).first()
    if collision:
        raise RuntimeError("Existing accounts have conflicting normalized emails. Resolve these accounts without deleting data, then retry.")
    db.execute(sa.text("UPDATE users SET email = lower(trim(email))"))
    op.create_index('uq_users_email_normalized', 'users', [sa.text('lower(trim(email))')], unique=True)
    # Widen ciphertext fields before encrypting every existing value.
    with op.batch_alter_table('cameras') as batch:
        for name in ('rtsp_url', 'username', 'password'):
            batch.alter_column(name, type_=sa.Text(), existing_type=sa.String(), existing_nullable=True)
    rows = db.execute(sa.text("SELECT id, rtsp_url, username, password FROM cameras")).mappings().all()
    encryptor = cipher()
    for row in rows:
        values = {name: encryptor.encrypt(row[name].encode()).decode() if row[name] is not None else None for name in ('rtsp_url','username','password')}
        db.execute(sa.text("UPDATE cameras SET rtsp_url=:rtsp_url, username=:username, password=:password WHERE id=:id"), values | {'id':row['id']})

def downgrade():
    raise RuntimeError("Downgrade would restore plaintext secrets; restore a coordinated database and key backup instead.")
