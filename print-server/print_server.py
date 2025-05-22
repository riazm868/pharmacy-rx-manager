"""
Zebra Print Server for Pharmacy RX Manager
This is a simple Flask server that simulates a print server for Zebra printers.
For production, this should be deployed on a Windows PC with the Zebra printer connected.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import logging

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

# Simulated printer list
PRINTERS = ["Zebra GK420D", "Microsoft Print to PDF"]

# Print job history
print_jobs = []

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
    return jsonify({
        "printers": PRINTERS,
        "default": "Zebra GK420D"
    })

@app.route('/print', methods=['POST'])
def print_label():
    """Print a label to the specified printer"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        zpl = data.get('zpl')
        printer = data.get('printer', 'Zebra GK420D')
        
        if not zpl:
            return jsonify({"success": False, "error": "No ZPL code provided"}), 400
        
        if printer not in PRINTERS:
            return jsonify({"success": False, "error": f"Printer '{printer}' not found"}), 404
        
        # In a real implementation, this would send the ZPL to the printer
        # For simulation, we'll just log it
        job_id = len(print_jobs) + 1
        print_jobs.append({
            "id": job_id,
            "printer": printer,
            "timestamp": time.time(),
            "zpl_length": len(zpl)
        })
        
        # Log the ZPL code to a file for debugging
        with open(f"print_job_{job_id}.zpl", "w") as f:
            f.write(zpl)
        
        logger.info(f"Print job {job_id} sent to {printer}")
        
        # Simulate printing delay
        time.sleep(1)
        
        return jsonify({
            "success": True,
            "job_id": job_id,
            "message": f"Print job sent to {printer}"
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
    return jsonify({
        "jobs": print_jobs
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Zebra Print Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
