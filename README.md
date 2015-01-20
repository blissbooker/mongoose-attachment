# mongoose-attachment

[![Build Status](https://travis-ci.org/blissbooker/mongoose-attachment.svg?branch=master)](https://travis-ci.org/blissbooker/mongoose-attachment)
[![Dependency Status](https://gemnasium.com/blissbooker/mongoose-attachment.svg)](https://gemnasium.com/blissbooker/mongoose-attachment)
[![Code Climate](https://codeclimate.com/github/blissbooker/mongoose-attachment/badges/gpa.svg)](https://codeclimate.com/github/blissbooker/mongoose-attachment)

## Configuration

### Filesystem Storage

```javascript
var mongoose = require('mongoose');
var attachment = require('mongoose-attachment');

var Asset = new mongoose.Schema({});

Asset.plugin(attachment, {
    {
        strategy: 'filesystem',
        attribute: 'image',
        config: {
            path: '/tmp/system',
            url: '/system'
        }
    }
});

module.exports = Asset;
```

## Usage

```javascript
var params = {
  asset: {
    image: {
      filename: 'foobar.png',
      fileSize: 300000,
      contentType: 'image/png'
    }
  },
  path: 'path/to/foobar.png'
};

var asset = new Asset(params.asset);
asset.attach(params.path, function (err) {
    if (err) {
        return fn(err);
    }
    asset.save();
});

asset.toJSON()
```

```json
{
  "_id": "548831d1e61bb2464310e803",
  "image": {
      "filename": "foobar.png",
      "fileSize": 300000,
      "contentType": "image/png",
      "url": "/system/548831d1e61bb2464310e803.png"
  }
}
```
