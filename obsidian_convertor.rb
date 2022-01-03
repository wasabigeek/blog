require "fileutils"

# OBSIDIAN_DIRECTORY = ENV['OBSIDIAN_DIRECTORY']

# source_file = ARGV.first
source_file = "Blog/My Learning Workflow for 2022.md"

article_path = File.join(OBSIDIAN_DIRECTORY, source_file)
original_md = File.open(article_path, "r").read

FILE_REGEX = /\!\[\[(?<file>.+)\]\]/
files_matchdata = original_md.scan(FILE_REGEX)
# copy files
files_matchdata.flatten.each do |filename|
  filepath = File.join(OBSIDIAN_DIRECTORY, "Files", filename)
  FileUtils.copy(filepath, "./content/blog/my-learning-workflow-for-2022/#{filename}")
end

new_md = original_md
  .gsub(/(?<!\!)\[\[(?<linktitle>.+)\]\]/, '\k<linktitle>')
  .gsub(FILE_REGEX, '![\k<file>](./\k<file>)')
File.open("./content/blog/my-learning-workflow-for-2022/index.md", "w+") do |file|
  file.write(new_md)
end