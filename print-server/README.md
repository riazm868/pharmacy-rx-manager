# Zebra Print Server for Pharmacy RX Manager

This is a simple Flask server that simulates a print server for Zebra printers. For production, this should be deployed on a Windows PC with the Zebra printer connected.

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- Zebra GK420D printer (or compatible) connected to the Windows PC
- Zebra printer drivers installed

### Installation

1. Clone or copy this directory to your Windows PC
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Run the print server:

```bash
python print_server.py
```

The server will start on port 5000 by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints

- `GET /status` - Check if the print server is online
- `GET /printers` - Get a list of available printers
- `POST /print` - Send a print job to the printer
- `GET /jobs` - Get a list of print jobs

### Print Job Format

To send a print job, make a POST request to `/print` with the following JSON payload:

```json
{
  "zpl": "^XA^FO50,50^ADN,36,20^FDHello World^FS^XZ",
  "printer": "Zebra GK420D"
}
```

## Configuration in Pharmacy RX Manager

1. In the Pharmacy RX Manager application, click on the "Configure Printer" button in the print dialog
2. Enter the URL of the print server (e.g., `http://192.168.1.100:5000`)
3. Click "Check" to verify the connection

## Troubleshooting

- If the print server is not responding, check that it's running and that the URL is correct
- If the printer is not printing, check that it's connected and turned on
- Check the `print_server.log` file for error messages

## Production Deployment

For production use, consider:

1. Setting up the server as a Windows service to run automatically on startup
2. Implementing proper authentication for the API
3. Using HTTPS for secure communication
4. Implementing proper error handling and logging

## License

This software is provided as-is, without any warranty. Use at your own risk.
