# app/models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from .database import Base

# User model for storing user information
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationship to the queries and databases
    databases = relationship('Database', back_populates='user')
    queries = relationship('Query', back_populates='user')

# Database model for storing uploaded database information
class Database(Base):
    __tablename__ = 'databases'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='databases')
    queries = relationship('Query', back_populates='database')

# Query model for storing user queries and the response
class Query(Base):
    __tablename__ = 'queries'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    database_id = Column(Integer, ForeignKey('databases.id', ondelete='SET NULL'), nullable=True)
    query_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='queries')
    database = relationship('Database', back_populates='queries')
