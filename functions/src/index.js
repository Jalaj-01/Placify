const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const admin = require('firebase-admin')

admin.initializeApp()

setGlobalOptions({ maxInstances: 10 })

// Phase 5: parseURL
// Phase 8: analyzePreparation, generateInterviewBrief, explainTopic

exports.parseURL = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.')
  }
  throw new HttpsError('unimplemented', 'parseURL will be implemented in Phase 5.')
})

exports.analyzePreparation = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.')
  }
  throw new HttpsError('unimplemented', 'analyzePreparation will be implemented in Phase 8.')
})

exports.generateInterviewBrief = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.')
  }
  throw new HttpsError('unimplemented', 'generateInterviewBrief will be implemented in Phase 8.')
})

exports.explainTopic = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.')
  }
  throw new HttpsError('unimplemented', 'explainTopic will be implemented in Phase 8.')
})
