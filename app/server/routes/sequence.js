const Joi = require('joi')
const boom = require('@hapi/boom')

const batch = require('../../processing/batch')

const minSequenceNumber = 1
const maxSequenceNumber = 9999
const maxCsSequenceNumber = 99999
const csSchemeId = 5

const schemesWithoutSequenceMaximum = [4, 7, 9, 10, 11, 17, 18]

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
        next: Joi.when('schemeId', {
          switch: [
            {
              is: csSchemeId,
              then: Joi.number()
                .integer()
                .min(minSequenceNumber)
                .max(maxCsSequenceNumber)
                .required()
            },
            {
              is: Joi.valid(...schemesWithoutSequenceMaximum),
              then: Joi.number()
                .integer()
                .min(minSequenceNumber)
                .required()
            }
          ],
          otherwise: Joi.number()
            .integer()
            .min(minSequenceNumber)
            .max(maxSequenceNumber)
            .required()
        })
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
