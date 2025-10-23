from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from db.database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    structure = Column(JSON, nullable=False)  # nodes + edges
    created_at = Column(DateTime, server_default=func.now())

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    query = Column(Text)
    response = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
