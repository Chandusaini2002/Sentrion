"""Register the uploaded baseline only if the existing schema matches it exactly.

Use only for an existing database that has no recorded Alembic revision.
Never deletes rows or changes application tables.
"""
import importlib.util
from pathlib import Path
import sqlalchemy as sa
from alembic import command
from alembic.config import Config
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from app.core.database import engine

class BaselineCollector:
    def __init__(self):
        self.metadata = sa.MetaData()
    def f(self, name):
        return name
    def create_table(self, name, *columns, **kwargs):
        sa.Table(name, self.metadata, *columns, **kwargs)
    def create_index(self, name, table, columns, unique=False):
        sa.Index(name, *(self.metadata.tables[table].c[column] for column in columns), unique=unique)

def main():
    root = Path(__file__).resolve().parents[1]
    spec = importlib.util.spec_from_file_location('baseline', root/'alembic/versions/0001_baseline.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    collector = BaselineCollector()
    module.op = collector
    module.upgrade()
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        if context.get_current_heads():
            raise SystemExit('An Alembic revision already exists. Preserve your migration history; do not stamp a different baseline.')
        differences = compare_metadata(context, collector.metadata)
        if differences:
            raise SystemExit('Schema differs from the uploaded baseline. No changes made. Reconcile your existing migrations before upgrading.')
    config = Config(str(root/'alembic.ini'))
    command.stamp(config, '0001_baseline')
    print('Matching existing schema registered. Now run: alembic upgrade head')

if __name__ == '__main__':
    main()
