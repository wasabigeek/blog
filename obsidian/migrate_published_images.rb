# Dir.pwd is based on running this from /obsidian folder
directory = File.join(Dir.pwd, '../content/blog/')

# renamed_files_mapping = {}
# obsidian_blog_post.files.each do |obsidian_blog_file|
#   original_filename = obsidian_blog_file.filename
#   new_filename = original_filename.gsub(' ', '_')
#   FileUtils.copy(
#     obsidian_blog_file.absolute_path,
#     File.join(directory, new_filename)
#   )
#   renamed_files_mapping[original_filename] = new_filename
# end

# File.open("#{directory}/index.md", 'w+') do |file|
#   gatsby_markdown = obsidian_blog_post.github_markdown_string
#   renamed_files_mapping.each do |original, renamed|
#     gatsby_markdown.gsub!(original, renamed)
#   end
#   file.write(gatsby_markdown)
# end
