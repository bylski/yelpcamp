import BaseJoi from 'joi'
import sanitizeHtml from 'sanitize-html'

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

export const campValidationSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    location: Joi.string().required(),
    images: Joi.object({
        path: Joi.string(),
        filename: Joi.string()
    }),
    deletedImages: Joi.array()
})   

export const reviewValidationSchema = Joi.object({
    body: Joi.string().allow(''),
    rating: Joi.number().min(0).max(5).required()
}).required()