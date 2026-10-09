const Joi = require('joi')
const boom = require('@hapi/boom')

const batch = require('../../processing/batch')

const minSequenceNumber = 1
const maxSequenceNumber = 9999

module.exports = [{
  method: 'GET',
  path: '/sequence',
  options: {
    handler: async (_request, h) => {
      try {
        const sequences = await batch.getAllSequences()

        return h.response({
          sequences
        })
      } catch (err) {
        console.error('Failed to retrieve sequences', err)
        throw boom.internal('Failed to retrieve sequences')
      }
    }
  }
},
{
  method: 'POST',
  path: '/update-sequence',
  options: {
    validate: {
      payload: Joi.object({
        schemeId: Joi.number().integer().required(),
        next: Joi.number().integer().min(minSequenceNumber).max(maxSequenceNumber).required()
      }),
      failAction: (_request, _h, error) => {
        throw boom.badRequest(error.details[0].message)
      }
    },
    handler: async (request, h) => {
      const { schemeId, next } = request.payload

      await batch.updateSequence(schemeId, next)

      return h.response({
        schemeId,
        next
      })
    }
  }
}]
