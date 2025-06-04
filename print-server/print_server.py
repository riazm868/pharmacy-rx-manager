"""
Zebra Print Server for Pharmacy RX Manager
This is a Flask server that handles printing to Zebra printers via Windows.
For production, this should be deployed on a Windows PC with the Zebra printer connected.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import logging
import sys
import tempfile
import subprocess
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('print_server.log')
    ]
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Print job history - store recent jobs in memory
print_jobs = []
MAX_STORED_JOBS = 100

# Get available printers
def get_available_printers():
    try:
        if sys.platform == 'win32':
            # On Windows, use wmic to get printer list
            output = subprocess.check_output(['wmic', 'printer', 'get', 'name']).decode('utf-8')
            printers = [printer.strip() for printer in output.split('\n')[1:] if printer.strip()]
            return printers
        else:
            # For development on non-Windows platforms, return simulated list
            # Include the specific printer name mentioned by the user
            return ["ZDesigner GK420d (Copy 1)", "Zebra GK420D (Simulated)", "Microsoft Print to PDF"]
    except Exception as e:
        logger.error(f"Error getting printer list: {e}")
        return ["Error getting printer list"]

@app.route('/status', methods=['GET'])
def status():
    """Check if the print server is online"""
    logger.info("Status check received")
    return jsonify({
        "status": "online",
        "version": "1.0.0",
        "timestamp": time.time()
    })

@app.route('/printers', methods=['GET'])
def get_printers():
    """Get a list of available printers"""
    logger.info("Printer list requested")
    printers = get_available_printers()
    
    # Find default Zebra printer if available
    # Look for both 'zebra' and 'zdesigner' in printer names
    default_printer = next(
        (printer for printer in printers if 'zebra' in printer.lower() or 'zdesigner' in printer.lower()), 
        printers[0] if printers else None
    )
    
    return jsonify({
        "printers": printers,
        "default": default_printer
    })

@app.route('/print', methods=['POST'])
def print_label():
    """Print a label to the specified printer"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        zpl = data.get('zpl')
        printer_name = data.get('printer')
        
        if not zpl:
            return jsonify({"success": False, "error": "No ZPL code provided"}), 400
        
        # Get available printers
        printers = get_available_printers()
        
        # If no printer specified or printer not found, use default
        if not printer_name or printer_name not in printers:
            # Find a Zebra printer (including ZDesigner variants)
            zebra_printers = [p for p in printers if 'zebra' in p.lower() or 'zdesigner' in p.lower()]
            if zebra_printers:
                printer_name = zebra_printers[0]
            elif printers:
                printer_name = printers[0]
            else:
                return jsonify({"success": False, "error": "No printers available"}), 404
        
        # Generate a unique job ID
        job_id = f"{int(time.time())}_{len(print_jobs) + 1}"
        
        # Create a temporary file with the ZPL content
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_dir = os.path.join(tempfile.gettempdir(), "pharmacy_labels")
        os.makedirs(temp_dir, exist_ok=True)
        zpl_file_path = os.path.join(temp_dir, f"label_{timestamp}_{job_id}.zpl")
        
        with open(zpl_file_path, "w") as f:
            f.write(zpl)
        
        logger.info(f"Created ZPL file at {zpl_file_path}")
        
        # Print the file
        success = False
        message = ""
        
        try:
            if sys.platform == 'win32':
                # On Windows, use the actual printing command
                # Handle printer names with spaces and special characters
                printer_path = f"\\\\.\\{printer_name}"
                cmd = ['copy', '/b', zpl_file_path, printer_path]
                logger.info(f"Executing print command: copy /b {zpl_file_path} {printer_path}")
                subprocess.run(cmd, check=True, shell=True)
                success = True
                message = f"Print job sent to {printer_name}"
            else:
                # For development on non-Windows platforms
                logger.info(f"Simulating print to {printer_name} (non-Windows environment)")
                # Simulate printing delay
                time.sleep(1)
                success = True
                message = f"Simulated print job sent to {printer_name}"
        except subprocess.CalledProcessError as e:
            logger.error(f"Printing error: {e}")
            message = f"Error printing to {printer_name}: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error during printing: {e}")
            message = f"Unexpected error: {str(e)}"
        
        # Record the job
        job_info = {
            "id": job_id,
            "printer": printer_name,
            "timestamp": time.time(),
            "zpl_length": len(zpl),
            "file_path": zpl_file_path,
            "success": success
        }
        
        # Add to job history and maintain max size
        print_jobs.append(job_info)
        if len(print_jobs) > MAX_STORED_JOBS:
            print_jobs.pop(0)
        
        logger.info(f"Print job {job_id} processed: {success}")
        
        return jsonify({
            "success": success,
            "job_id": job_id,
            "message": message
        })
        
    except Exception as e:
        logger.error(f"Error processing print request: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/jobs', methods=['GET'])
def get_jobs():
    """Get a list of print jobs"""
    # Optionally filter by count or time range
    count = request.args.get('count', type=int)
    if count:
        jobs = print_jobs[-count:]
    else:
        jobs = print_jobs
    
    return jsonify({
        "jobs": jobs,
        "total": len(print_jobs)
    })

@app.route('/job/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get details of a specific print job"""
    job = next((job for job in print_jobs if str(job["id"]) == job_id), None)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    return jsonify(job)

@app.route('/test_print', methods=['POST'])
def test_print():
    """Send a test print job to verify printer connectivity"""
    try:
        data = request.json
        printer_name = data.get('printer')
        
        # Get available printers
        printers = get_available_printers()
        
        # If no printer specified or printer not found, use default
        if not printer_name or printer_name not in printers:
            # Find a Zebra printer (including ZDesigner variants)
            zebra_printers = [p for p in printers if 'zebra' in p.lower() or 'zdesigner' in p.lower()]
            if zebra_printers:
                printer_name = zebra_printers[0]
            elif printers:
                printer_name = printers[0]
            else:
                return jsonify({"success": False, "error": "No printers available"}), 404
        
        # Simple test ZPL code - optimized for 3x2 inch label
        test_zpl = """^XA
^CF0,30
^FO20,20^GB760,380,2^FS
^FO30,30^FDTest Print^FS
^FO30,80^FDZDesigner GK420d^FS
^FO30,130^FDPharmacy RX Manager^FS
^FO30,180^FD{timestamp}^FS
^FO30,250^FDIf you can read this, printing works!^FS
^XZ""".format(timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
        # Create a request with the test ZPL
        test_request = type('obj', (object,), {
            'json': {
                'zpl': test_zpl,
                'printer': printer_name
            }
        })
        
        # Use the existing print function
        with app.test_request_context():
            request._cached_json = test_request.json
            response = print_label()
            
        return response
        
    except Exception as e:
        logger.error(f"Error processing test print: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')
    
    # Log startup information
    logger.info(f"Starting Zebra Print Server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"Platform: {sys.platform}")
    logger.info(f"Available printers: {get_available_printers()}")
    
    # Run the server
    app.run(host=host, port=port, debug=debug)
