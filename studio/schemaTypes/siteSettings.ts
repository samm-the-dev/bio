import {defineField, defineType} from 'sanity'
import {richTextBlock} from './richText'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Display Name',
      type: 'string',
      description: 'Appears in the header nav and as the home page hero title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'descriptor',
      title: 'Descriptor',
      type: 'string',
      description: 'Shown below the name on the home page hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub Profile URL',
      type: 'url',
    }),
    defineField({
      name: 'repoUrl',
      title: 'GitHub Repo URL',
      type: 'url',
      description: 'Used in the footer "Source on GitHub" link',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      rows: 3,
      description: 'Quote or one-liner on the home page hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'taglineAttribution',
      title: 'Tagline Attribution',
      type: 'string',
    }),
    defineField({
      name: 'taglineUrl',
      title: 'Tagline Source URL',
      type: 'url',
      description: 'If set, the attribution becomes a link',
    }),
    defineField({
      name: 'intro',
      title: 'Home Intro',
      type: 'array',
      of: [{...richTextBlock}],
      description: 'Opening paragraphs on the home page below the hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projectsTeaser',
      title: 'Projects Teaser',
      type: 'string',
      description: 'One sentence on the Projects card in the home page grid',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutTeaser',
      title: 'About Teaser',
      type: 'string',
      description: 'One sentence on the About card in the home page grid',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blogTeaser',
      title: 'Blog Teaser',
      type: 'string',
      description: 'One sentence on the Blog card in the home page grid',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutImprov',
      title: 'About: Improv',
      type: 'array',
      of: [{...richTextBlock}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutMovies',
      title: 'About: Movies',
      type: 'array',
      of: [{...richTextBlock}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutTtrpgs',
      title: 'About: TTRPGs',
      type: 'array',
      of: [{...richTextBlock}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutCode',
      title: 'About: Code',
      type: 'array',
      of: [{...richTextBlock}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [{type: 'socialLink'}],
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default Meta Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
