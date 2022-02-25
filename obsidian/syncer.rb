require 'active_support/inflector/methods'
require 'active_support/inflector/transliterate'
require 'fileutils'

require_relative './obsidian_blog_post'

def parameterize(word)
  ActiveSupport::Inflector.parameterize(word, separator: '-')
end

OBSIDIAN_DIRECTORY = ENV['OBSIDIAN_DIRECTORY']

# source_file = ARGV.first
post_title = 'Reading a Ruby gem with VSCode'
source_file = "Blog/Published/#{post_title}.md"

article_path = File.join(OBSIDIAN_DIRECTORY, source_file)
obsidian_blog_post = ObsidianBlogPost.from_markdown_file(article_path)

directory = "../content/blog/#{parameterize(post_title)}/"
FileUtils.mkdir_p(directory)
# copy files
obsidian_blog_post.asset_filenames.each do |filename|
  filepath = File.join(OBSIDIAN_DIRECTORY, 'Files', filename)
  FileUtils.copy(filepath, "#{directory}#{filename}")
end

File.open("#{directory}/index.md", 'w+') do |file|
  file.write(obsidian_blog_post.to_blog_markdown)
end
