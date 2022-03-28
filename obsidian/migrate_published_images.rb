require 'fileutils'

# Dir.pwd is based on running this from /obsidian folder
blog_dir = Dir.new(File.expand_path('../content/blog/'))
blog_dir.each_child do |post_dirname|
  post_dirpath = File.join(blog_dir.path, post_dirname)
  images = []
  next if Dir.new(post_dirpath).children.empty?

  Dir.new(post_dirpath).each_child do |post_itemname|
    next if post_itemname == 'index.md'

    images << post_itemname
  end

  markdown_filepath = File.join(post_dirpath, 'index.md')
  markdown = File.read(markdown_filepath)
  File.open(markdown_filepath, 'w') do |file|
    images.each do |original_imagename|
      new_imagename = original_imagename.gsub(' ', '_')
      next if original_imagename == new_imagename

      FileUtils.mv(
        File.join(post_dirpath, original_imagename),
        File.join(post_dirpath, new_imagename)
      )
      markdown.gsub!("(./#{original_imagename})", "(./#{new_imagename})")
    end
    file.write(markdown)
  end
end
