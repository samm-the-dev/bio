import {defineArrayMember} from 'sanity'

export const richTextBlock = defineArrayMember({
  type: 'block',
  marks: {
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
            validation: (rule) =>
              rule.required().uri({allowRelative: true, scheme: ['http', 'https']}),
          },
        ],
      },
    ],
  },
})
