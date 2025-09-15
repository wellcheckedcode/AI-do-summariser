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
import signal
from pathlib import Path

# Global variables to track processes
backend_process = None
frontend_process = None

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n[SHUTDOWN] Shutting down all services...")
    if backend_process:
        backend_process.terminate()
    if frontend_process:
        frontend_process.terminate()
    sys.exit(0)

def start_backend():
    """Start the backend server"""
    global backend_process
    backend_dir = Path(__file__).parent / "backend"
    
    print("[STARTUP] Starting Backend Server...")
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            shell=True
        )
        
        # Print backend output
        for line in backend_process.stdout:
            print(f"[BACKEND] {line.strip()}")
            
    except Exception as e:
        print(f"[ERROR] Error starting backend: {e}")

def start_frontend():
    """Start the frontend development server"""
    global frontend_process
    # Run the frontend dev server directly inside the frontend directory
    frontend_dir = Path(__file__).parent / "frontend"
    
    print("[STARTUP] Starting Frontend Server...")
    try:
        # On Windows, npm executable is npm.cmd
        npm_exec = "npm.cmd" if os.name == "nt" else "npm"
        frontend_process = subprocess.Popen(
            [npm_exec, "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            shell=False
        )
        
        # Print frontend output
        for line in frontend_process.stdout:
            print(f"[FRONTEND] {line.strip()}")
            
    except Exception as e:
        print(f"[ERROR] Error starting frontend: {e}")

def main():
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    print("Metro Zen Flow - Full Stack Application")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("package.json"):
        print("[ERROR] package.json not found!")
        print("Please run this script from the project root directory")
        sys.exit(1)
    
    if not os.path.exists("backend/app.py"):
        print("[ERROR] backend/app.py not found!")
        print("Please make sure the backend directory exists")
        sys.exit(1)
    
    print("[SUCCESS] Project structure verified")
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
    
    # Start frontend in a separate thread
    frontend_thread = threading.Thread(target=start_frontend, daemon=True)
    frontend_thread.start()
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()