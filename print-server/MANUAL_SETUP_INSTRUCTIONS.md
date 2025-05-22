# Manual Setup Instructions for Zebra Print Server

Since you're encountering issues with the automatic setup, here are manual instructions to set up the print server on the Windows PC:

## Step 1: Install Required Packages

Open Command Prompt and run:

```
pip install Flask==2.3.3 flask-cors==4.0.0 pywin32==306
```

If you get an error about pip, try updating pip first:

```
python -m pip install --upgrade pip
```

## Step 2: Run the Print Server

After installing the packages, you can run the print server directly:

```
python windows_print_server.py
```

The server should start and display its IP address. Make note of this IP address as you'll need it to configure the Pharmacy RX Manager application.

## Step 3: Configure Firewall (if needed)

If you can't connect to the print server from another computer, you may need to:

1. Open Windows Firewall
2. Add an exception for port 5000
3. Allow Python to communicate through the firewall

## Troubleshooting

- If you get errors about missing modules, make sure all packages are installed:
  ```
  pip install Flask flask-cors pywin32
  ```

- If the server starts but you can't connect from another computer, check that both computers are on the same network and that the firewall isn't blocking connections.

- If the printer isn't detected, make sure it's connected and that the drivers are installed.

## Testing the Server

Once the server is running, you can test it by opening a web browser and navigating to:
```
http://localhost:5000/status
```

You should see a JSON response indicating the server is online.
