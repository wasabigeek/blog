require 'active_support/inflector/methods'
require 'active_support/inflector/transliterate'

require_relative './obsidian_blog_post'
require_relative './gatsby_blog_post'

OBSIDIAN_DIRECTORY = ENV['OBSIDIAN_DIRECTORY']

# source_file = ARGV.first
post_title = 'Why is Polymorphism important?'

Obsidian.directory = OBSIDIAN_DIRECTORY
obsidian_blog_post = ObsidianBlogPost.from_filename(post_title)

GatsbyBlogPost.create_from(obsidian_blog_post)
