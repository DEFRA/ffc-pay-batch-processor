const Joi = require('joi')
const boom = require('@hapi/boom')
const { getSchemeIds } = require('ffc-pay-schemes')

const batch = require('../../processing/batch')

const {
  VET_VISITS,
  CS,
  ES,
  FC,
  IMPS,
  FPTT,
  WMP
} = getSchemeIds()

const minSequenceNumber = 1
const maxSequenceNumber = 9999
const maxCsSequenceNumber = 99999

const dpsSchemeId = 7

const schemesWithoutSequenceMaximum = new Set([
  VET_VISITS,
  dpsSchemeId,
  ES,
  FC,
  IMPS,
  FPTT,
  WMP
])

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
              is: CS,
              then: Joi.number()
                .integer()
                .min(minSequenceNumber)
                .max(maxCsSequenceNumber)
                .required()
            },
            {
              is: Joi.valid(...Array.from(schemesWithoutSequenceMaximum)),
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
