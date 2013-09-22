include("./library/Base/disconnect.js")

// disconnect from server
disconnect( Channel, Session );

// clean-up
Session = null;
Channel = null;