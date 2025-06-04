# Pharmacy RX Manager - Label Printing Guide

This guide provides instructions for setting up and using the label printing functionality with a Zebra GK420D thermal printer.

## Overview

The Pharmacy RX Manager application supports printing prescription labels to a Zebra GK420D thermal printer. The printing system consists of two main components:

1. **Web Application**: The React-based frontend that generates label content and sends print requests
2. **Print Server**: A Python Flask server that runs on a Windows PC connected to the Zebra printer

## Setup Instructions

### 1. Print Server Setup (Windows PC)

The print server must be installed on a Windows PC that has the Zebra printer connected via USB or network.

#### Requirements:
- Windows 10 or newer
- Python 3.8 or newer
- Zebra GK420D printer with drivers installed
- Network connectivity between the web application and the Windows PC

#### Installation:

1. Copy the `print-server` folder to the Windows PC
2. Install the required Python packages:
   ```
   pip install flask flask-cors
   ```
3. Start the print server:
   ```
   cd print-server
   python print_server.py
   ```
4. By default, the server runs on port 5000. You can change this by setting the `PORT` environment variable.
5. Make note of the Windows PC's IP address - you'll need this to configure the web application.

### 2. Web Application Configuration

1. Open the Pharmacy RX Manager application
2. Navigate to a prescription form
3. Click "Print Label" to open the print dialog
4. Click "Configure Printer" to open the configuration panel
5. Enter the print server URL (e.g., `http://192.168.1.100:5000`) and click "Check"
6. If the connection is successful, you'll see "Online" status and a list of available printers
7. Select the Zebra GK420D printer from the list
8. Click "Test Print" to verify the printer connection
9. Click "Close" to save the configuration

## Using Label Printing

Once configured, you can print prescription labels using either:

1. **Browser Printing**: This uses the browser's print dialog and is useful for testing or printing to non-Zebra printers.
2. **Zebra Direct Printing**: This sends ZPL code directly to the Zebra printer for optimal label formatting.

To print a label:

1. Open or create a prescription
2. Click "Print Label"
3. Review the label preview
4. Click "Print to Zebra" to send the label to the Zebra printer

## Troubleshooting

### Print Server Issues

- **Server shows as offline**: 
  - Verify the Windows PC is running and accessible on the network
  - Check that the print server is running (`python print_server.py`)
  - Verify there are no firewall rules blocking port 5000

- **No printers found**:
  - Verify the Zebra printer is connected and powered on
  - Check that the printer drivers are installed correctly
  - Try restarting the print server

### Printer Issues

- **Print job sent but nothing prints**:
  - Check that the printer has labels loaded
  - Verify the printer is online (green light)
  - Check for paper jams or other printer errors

- **Label formatting issues**:
  - Ensure you're using the correct label size (3" x 2")
  - Verify the ZPL code is compatible with your printer model
  - Check printer settings for darkness and print speed

## Label Customization

The label format can be customized by modifying:

1. `PrescriptionLabel.tsx` - For the browser preview
2. `printService.ts` - For the ZPL code sent to the Zebra printer

When making changes, ensure both components are updated to maintain consistency between the preview and the printed label.

## Technical Details

### ZPL Code

The application generates ZPL (Zebra Programming Language) code for optimal printing on thermal printers. The ZPL code includes:

- Patient information
- Prescription details
- Medication instructions
- Pharmacy information

### Print Server API

The print server provides the following endpoints:

- `GET /status` - Check if the server is online
- `GET /printers` - Get a list of available printers
- `POST /print` - Send a print job to a printer
- `POST /test_print` - Send a test print job
- `GET /jobs` - Get a list of recent print jobs

## Security Considerations

- The print server does not implement authentication by default
- For production use, consider adding authentication and HTTPS
- Restrict network access to the print server to trusted devices only
