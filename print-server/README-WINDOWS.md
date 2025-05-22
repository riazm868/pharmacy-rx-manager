# Zebra Print Server for Windows

This package contains everything needed to set up a print server for Zebra printers on a Windows PC. This print server will allow your Pharmacy RX Manager application to send print jobs to a Zebra printer connected to this Windows PC.

## Installation Instructions

### Prerequisites

- Windows 10 or newer
- Python 3.7 or higher
- Zebra GK420D printer (or compatible) connected to this Windows PC
- Zebra printer drivers installed and working

### Setup Steps

1. **Copy this entire folder** to the Windows PC that has the Zebra printer connected

2. **Run the setup script**:
   - Double-click on `setup_windows.bat`
   - This will install all required dependencies

3. **Start the print server**:
   - Double-click on `windows_print_server.py` or run from command prompt:
   ```
   python windows_print_server.py
   ```
   - The server will display its IP address when started
   - Keep this window open while using the print server

4. **Configure your Pharmacy RX Manager application**:
   - In the application, click on "Configure Printer" in the print dialog
   - Enter the URL shown in the print server console (e.g., `http://192.168.1.100:5000`)
   - Click "Check" to verify the connection

## Troubleshooting

### Print Server Issues

- **Server won't start**: Make sure Python is installed and added to PATH
- **Missing dependencies**: Run `pip install -r requirements-windows.txt` manually
- **Port already in use**: Change the port in the script or close the application using port 5000

### Printer Issues

- **Printer not found**: Make sure the Zebra printer is connected and powered on
- **Print jobs fail**: Check that the correct Zebra drivers are installed
- **Wrong printer used**: Specify the exact printer name in the print request

### Network Issues

- **Can't connect from application**: Make sure both computers are on the same network
- **Firewall blocking**: Add an exception for port 5000 in Windows Firewall

## Log Files

The print server creates a log file `print_server.log` in the same directory. Check this file for detailed error messages if you encounter issues.

## Making the Print Server Start Automatically

To have the print server start automatically when Windows boots:

1. Create a shortcut to `windows_print_server.py`
2. Press `Win+R`, type `shell:startup` and press Enter
3. Move the shortcut to the Startup folder that opens

## Support

If you encounter any issues, please contact your system administrator or the application developer.
