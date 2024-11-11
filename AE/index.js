// const express = require('express');
// const router = express.Router();

// // Import other API routes here
// const myusers = require('./myusers');

// // Register routes
// router.use('/myusers', myusers);

// module.exports = router;

// This will handle all the routes manually
export default function (req, res, next) {
    if (req.url.startsWith('/impactvkinsert')) {
      // Delegate to the myusers handler
      return require('./impact_vk_insert').default(req, res);
    }
    if (req.url.startsWith('/impactvkupdate')) {
      // Delegate to the myusers handler
      return require('./impact_vk_update').default(req, res);
    }
    if (req.url.startsWith('/aevkinsert')) {
      // Delegate to the myusers handler
      return require('./ae_vk_insert').default(req, res);
    }
  
    // If no matching route, pass it on to the next middleware
    next();
  }