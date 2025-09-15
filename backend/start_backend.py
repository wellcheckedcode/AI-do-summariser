#!/usr/bin/env python3
"""
Backend startup script for Metro Zen Flow
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("[SUCCESS] Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Error installing requirements: {e}")
        return False
    return True

def start_server():
    """Start the Flask server"""
    try:
        print("[STARTUP] Starting Metro Zen Flow Backend Server...")
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Server stopped by user")
    except Exception as e:
        print(f"[ERROR] Error starting server: {e}")

if __name__ == "__main__":
    print("Metro Zen Flow Backend Setup")
    print("=" * 40)
    
    # Check if .env file exists
    if not os.path.exists("ab.env"):
        print("[ERROR] ab.env file not found!")
        print("Please make sure the ab.env file exists in the backend directory")
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Start server
    start_server()

