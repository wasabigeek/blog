require "active_support/inflector/methods"
require "active_support/inflector/transliterate"
require "fileutils"

def parameterize(word)
  ActiveSupport::Inflector.parameterize(word, separator: '-')
end

OBSIDIAN_DIRECTORY = ENV['OBSIDIAN_DIRECTORY']

# source_file = ARGV.first
post_title = "Reading a Ruby gem with VSCode"
source_file = "Blog/Published/#{post_title}.md"

article_path = File.join(OBSIDIAN_DIRECTORY, source_file)
original_md = File.open(article_path, "r").read

FILE_REGEX = /\!\[\[(?<file>.+)\]\]/
files_matchdata = original_md.scan(FILE_REGEX)
directory = "../content/blog/#{parameterize(post_title)}/"
FileUtils.mkdir_p(directory)
# copy files
files_matchdata.flatten.each do |filename|
  filepath = File.join(OBSIDIAN_DIRECTORY, "Files", filename)
  FileUtils.copy(filepath, "#{directory}#{filename}")
end

new_md = original_md
  .gsub(/(?<!\!)\[\[(?<linktitle>.+)\]\]/, '\k<linktitle>')
  .gsub(FILE_REGEX, '![\k<file>](./\k<file>)')
File.open("#{directory}/index.md", "w+") do |file|
  file.write(new_md)
end