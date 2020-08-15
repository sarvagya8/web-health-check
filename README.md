Web Health Check
===

check if your website fails

## Installation

### Step one

install mongodb and create a collection

### Step clone this project

```
git clone git@github.com:sarvagya8/web-health-check.git
cd health-check
```

### Step three add your configuration

```
sudo cp config-default.js /etc/health_check/config.js
```

then add your configuration, smtp server etc.

### Finally

```
node app.js
```
