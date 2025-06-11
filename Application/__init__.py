"""
    File responsible for the intialization and creation of our configured
    Flask application 

    The video below discussed how to intialize and deploy a Flask app connected to a 
    PostgreSQL database and laid the foundation for the set up of our flask application
    and database intialization. This was one of the foundational files.

    Video reference: https://www.youtube.com/watch?v=IBfj_0Zf2Mo 

    authors = Timothy Berlanga
"""
import os 
from flask import Flask

# Enables Cross-Origin Resoure Sharing allowing for the frontend to interact with the backend
from flask_cors import CORS
# Handles database schema changes through migration scripts to update the DB
from flask_migrate import Migrate

def create_app():
    """
    Function to initialize and configure the Flask app.

    Return: 
        Configured Flask app instance 
    """
    from .routes import strava 

    # Create a flask application instance 
    app = Flask(__name__)
    app.secret_key = 'a9f3b7c1d5e6428f9e1a4c7b0d3e8f21'  # change this in production

    
    # Enables CORS to allow request from specific frontend origins 
    # These origins are our local testing urls from codespaces, vscode, and the deployed react render url 
    CORS(app, origins=[
    "http://localhost:5173"])


    app.register_blueprint(strava)

    # Creates a fully configured flask instance connected to our database, routes, and allows for CORS
    return app
