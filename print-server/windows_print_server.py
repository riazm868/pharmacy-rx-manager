"""
Zebra Print Server for Pharmacy RX Manager
Windows-specific implementation that interfaces with Zebra printers
"""

# Import required libraries
import os
import sys
import time
import tempfile
import socket
import logging
import json
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import win32print

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

# Configure CORS more explicitly
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Print job history
print_jobs = []

@app.route('/status', methods=['GET', 'OPTIONS'])
def status():
    """Check if the print server is online"""
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
        
    logger.info("Status check received")
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    response = make_response(jsonify({
        "status": "online",
        "version": "1.0.0",
        "hostname": hostname,
        "ip_address": ip_address,
        "timestamp": time.time()
    }))
    return add_cors_headers(response)

# Helper function to add CORS headers to responses
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# Helper function for OPTIONS requests
def build_cors_preflight_response():
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/printers', methods=['GET', 'OPTIONS'])
def get_printers():
    """Get a list of available printers"""
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
        
    logger.info("Printer list requested")
    try:
        printer_list = []
        default_printer = None
        
        # Get all printers
        for printer in win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL, None, 1):
            printer_name = printer[2]
            printer_list.append(printer_name)
            
            # Check if this is the default printer
            if win32print.GetDefaultPrinter() == printer_name:
                default_printer = printer_name
        
        logger.info(f"Found {len(printer_list)} printers. Default: {default_printer}")
        
        response = make_response(jsonify({
            "printers": printer_list,
            "default": default_printer
        }))
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"Error getting printer list: {str(e)}")
        response = make_response(jsonify({
            "error": str(e),
            "printers": []
        }), 500)
        return add_cors_headers(response)

@app.route('/print', methods=['POST', 'OPTIONS'])
def print_label():
    """Print a label to the specified printer"""
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
        
    try:
        data = request.json
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        zpl = data.get('zpl')
        printer_name = data.get('printer')
        
        if not zpl:
            return jsonify({"success": False, "error": "No ZPL code provided"}), 400
        
        if not printer_name:
            # Use default printer if none specified
            printer_name = win32print.GetDefaultPrinter()
            logger.info(f"No printer specified, using default: {printer_name}")
        
        # Check if printer exists
        printer_exists = False
        for printer in win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL, None, 1):
            if printer[2] == printer_name:
                printer_exists = True
                break
        
        if not printer_exists:
            response = make_response(jsonify({
                "success": False,
                "error": f"Printer '{printer_name}' not found"
            }), 404)
            return add_cors_headers(response)
        
        # Create a temporary file with the ZPL code
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zpl', mode='w')
        temp_file.write(zpl)
        temp_file.close()
        
        # Open the printer
        logger.info(f"Opening printer: {printer_name}")
        printer_handle = win32print.OpenPrinter(printer_name)
        
        try:
            # Start a print job
            job_id = win32print.StartDocPrinter(printer_handle, 1, ("Prescription Label", None, "RAW"))
            
            try:
                win32print.StartPagePrinter(printer_handle)
                
                # Read and send the ZPL file to the printer
                with open(temp_file.name, 'rb') as f:
                    zpl_data = f.read()
                    win32print.WritePrinter(printer_handle, zpl_data)
                
                win32print.EndPagePrinter(printer_handle)
            finally:
                win32print.EndDocPrinter(printer_handle)
        finally:
            win32print.ClosePrinter(printer_handle)
        
        # Clean up the temporary file
        os.unlink(temp_file.name)
        
        # Record the print job
        print_job = {
            "id": len(print_jobs) + 1,
            "printer": printer_name,
            "timestamp": time.time(),
            "zpl_length": len(zpl)
        }
        print_jobs.append(print_job)
        
        logger.info(f"Print job {print_job['id']} sent to {printer_name}")
        
        response = make_response(jsonify({
            "success": True,
            "job_id": print_job['id'],
            "printer": printer_name,
            "message": f"Print job sent to {printer_name}"
        }), 200)
        return add_cors_headers(response)
        
    except Exception as e:
        logger.error(f"Error processing print request: {str(e)}")
        response = make_response(jsonify({
            "success": False,
            "error": str(e)
        }), 500)
        return add_cors_headers(response)

@app.route('/jobs', methods=['GET', 'OPTIONS'])
def get_jobs():
    """Get a list of print jobs"""
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
        
    response = make_response(jsonify({
        "jobs": print_jobs
    }))
    return add_cors_headers(response)

@app.route('/test_print', methods=['POST', 'OPTIONS'])
def test_print():
    """Send a test print job to verify printer connectivity"""
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
        
    try:
        data = request.json
        printer_name = data.get('printer')
        
        # If no printer specified, use default
        if not printer_name:
            printer_name = win32print.GetDefaultPrinter()
            logger.info(f"No printer specified for test print, using default: {printer_name}")
        
        # Check if printer exists
        printer_exists = False
        for printer in win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL, None, 1):
            if printer[2] == printer_name:
                printer_exists = True
                break
        
        if not printer_exists:
            response = make_response(jsonify({
                "success": False,
                "error": f"Printer '{printer_name}' not found"
            }), 404)
            return add_cors_headers(response)
        
        # Simple test ZPL code - optimized for 3x2 inch label with improved formatting
        # Adjusted to start from the left edge of the label with Helvetica font
        test_zpl = """^XA

^PW609
^LL406
^LS0
^LH0,0

^CFA,0,0
^FO10,30^GB589,360,2^FS

^XA^DFE:HELV.FNT^FS

^CFA,26,13
^FO20,50^FDTest Print - Zebra GK420d^FS

^CFA,18,9
^FO400,55^FDDATE: {date}^FS

^FO20,80^GB569,1,2^FS

^CFA,20,10
^FO20,95^FDPrinter: {printer}^FS

^FO20,135^GB569,1,1^FS

^CFB,24,12
^FO20,165^FDIf you can read this, printing works!^FS

^CFA,22,11
^FO20,225^FDPersonal Care Pharmacy Ltd^FS

^CFA,18,9
^FO20,255^FD72 Aranguez Main Rd, San Juan^FS
^FO20,280^FDTel: 638-2889  Whatsapp: 352-2676^FS

^FO20,320^FDPharmacist: _______________________^FS

^XZ""".format(
            printer=printer_name,
            date=time.strftime("%d/%m/%y"),
            timestamp=time.strftime("%H:%M:%S")
        )
        
        # Create a temporary file with the ZPL code
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zpl', mode='w')
        temp_file.write(test_zpl)
        temp_file.close()
        
        # Open the printer
        logger.info(f"Opening printer for test print: {printer_name}")
        printer_handle = win32print.OpenPrinter(printer_name)
        
        try:
            # Start a print job
            job_id = win32print.StartDocPrinter(printer_handle, 1, ("Test Print", None, "RAW"))
            
            try:
                win32print.StartPagePrinter(printer_handle)
                
                # Read and send the ZPL file to the printer
                with open(temp_file.name, 'rb') as f:
                    zpl_data = f.read()
                    win32print.WritePrinter(printer_handle, zpl_data)
                
                win32print.EndPagePrinter(printer_handle)
            finally:
                win32print.EndDocPrinter(printer_handle)
        finally:
            win32print.ClosePrinter(printer_handle)
        
        # Clean up the temporary file
        os.unlink(temp_file.name)
        
        # Record the print job
        test_job = {
            "id": len(print_jobs) + 1,
            "printer": printer_name,
            "timestamp": time.time(),
            "type": "test_print"
        }
        print_jobs.append(test_job)
        
        logger.info(f"Test print job {test_job['id']} sent to {printer_name}")
        
        response = make_response(jsonify({
            "success": True,
            "job_id": test_job['id'],
            "printer": printer_name,
            "message": f"Test print sent to {printer_name}"
        }), 200)
        return add_cors_headers(response)
        
    except Exception as e:
        logger.error(f"Error processing test print request: {str(e)}")
        response = make_response(jsonify({
            "success": False,
            "error": str(e)
        }), 500)
        return add_cors_headers(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    logger.info(f"Starting Zebra Print Server on {hostname} ({ip_address}), port {port}")
    print(f"*****************************************************")
    print(f"* Zebra Print Server running at: http://{ip_address}:{port} *")
    print(f"* Use this URL in your Pharmacy RX Manager app      *")
    print(f"*****************************************************")
    app.run(host='0.0.0.0', port=port, debug=True)
