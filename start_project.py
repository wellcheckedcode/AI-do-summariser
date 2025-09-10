#!/usr/bin/env python3
"""
Metro Zen Flow Project Startup Script
Starts both frontend and backend services
"""
import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def start_backend():
    """Start the backend server"""
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    print("🚀 Starting Backend Server...")
    try:
        subprocess.run([sys.executable, "start_backend.py"])
    except KeyboardInterrupt:
        print("\n👋 Backend stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

def start_frontend():
    """Start the frontend development server"""
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    print("🚀 Starting Frontend Server...")
    try:
        subprocess.run(["npm", "run", "dev"])
    except KeyboardInterrupt:
        print("\n👋 Frontend stopped by user")
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

def main():
    print("Metro Zen Flow - Full Stack Application")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("package.json"):
        print("❌ Error: package.json not found!")
        print("Please run this script from the metro-zen-flow directory")
        sys.exit(1)
    
    if not os.path.exists("backend/app.py"):
        print("❌ Error: backend/app.py not found!")
        print("Please make sure the backend directory exists")
        sys.exit(1)
    
    print("✅ Project structure verified")
    print("\nStarting services...")
    print("Backend will run on: http://localhost:5000")
    print("Frontend will run on: http://localhost:5173")
    print("\nPress Ctrl+C to stop both services")
    print("-" * 50)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(3)
    
    # Start frontend (this will block)
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n👋 Shutting down all services...")
        sys.exit(0)

if __name__ == "__main__":
    main()

