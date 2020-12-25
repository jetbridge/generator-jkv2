import { Database } from "<%= title %>-core"

// xray
const AWSXRay = require("aws-xray-sdk")
AWSXRay.captureAWS(require("aws-sdk"))

// this might be wrong
export const db = new Database()
