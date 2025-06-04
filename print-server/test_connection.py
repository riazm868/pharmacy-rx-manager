"""
Test script to verify connection to the Zebra print server
"""
import requests
import json
import sys

def test_print_server(server_url, printer_name=None):
    """Test connection to the print server and send a test print if connected"""
    print(f"Testing connection to print server at {server_url}...")
    
    # Check server status
    try:
        status_response = requests.get(f"{server_url}/status", timeout=5)
        if status_response.status_code == 200:
            status_data = status_response.json()
            print(f"✅ Server is online (version: {status_data.get('version')})")
        else:
            print(f"❌ Server returned status code: {status_response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to connect to server: {e}")
        return False
    
    # Get available printers
    try:
        printers_response = requests.get(f"{server_url}/printers", timeout=5)
        if printers_response.status_code == 200:
            printers_data = printers_response.json()
            available_printers = printers_data.get('printers', [])
            default_printer = printers_data.get('default')
            
            if not available_printers:
                print("❌ No printers found")
                return False
            
            print(f"✅ Found {len(available_printers)} printer(s):")
            for i, printer in enumerate(available_printers):
                is_default = printer == default_printer
                print(f"  {i+1}. {printer}{' (default)' if is_default else ''}")
            
            # Use specified printer or default
            selected_printer = printer_name
            if not selected_printer:
                selected_printer = default_printer
                print(f"Using default printer: {selected_printer}")
            elif selected_printer not in available_printers:
                print(f"⚠️ Specified printer '{selected_printer}' not found, using default: {default_printer}")
                selected_printer = default_printer
            else:
                print(f"Using specified printer: {selected_printer}")
        else:
            print(f"❌ Failed to get printer list: {printers_response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to get printer list: {e}")
        return False
    
    # Send test print
    try:
        print(f"Sending test print to {selected_printer}...")
        test_data = {
            "printer": selected_printer
        }
        
        test_response = requests.post(
            f"{server_url}/test_print",
            json=test_data,
            timeout=10
        )
        
        if test_response.status_code == 200:
            result = test_response.json()
            if result.get('success'):
                print(f"✅ Test print sent successfully! Job ID: {result.get('job_id')}")
                return True
            else:
                print(f"❌ Test print failed: {result.get('error') or result.get('message')}")
                return False
        else:
            print(f"❌ Test print request failed with status code: {test_response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to send test print: {e}")
        return False

if __name__ == "__main__":
    # Default URL
    server_url = "http://localhost:5000"
    printer_name = None
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        server_url = sys.argv[1]
    if len(sys.argv) > 2:
        printer_name = sys.argv[2]
    
    # Run the test
    test_print_server(server_url, printer_name)
