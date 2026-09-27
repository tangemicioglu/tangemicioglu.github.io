# Run with the site's bundle: bundle exec ruby tests/publication-authors.rb
require 'liquid'

template = Liquid::Template.parse(File.read(File.expand_path('../_includes/publication-authors-short.html', __dir__)))
cases = {
  'One' => 'One',
  '<b>One</b>, Two' => '<b>One</b>, Two',
  'One, Two, Three' => 'One et al.',
  'One*, <b>Two*</b>, Three, Four**, Five**' => 'One*, <b>Two*</b> et al.',
  'One*, Two*, <b>Three</b>*, Four' => 'One*, Two*, <b>Three</b>* et al.',
  'One*, Two*, Three*' => 'One*, Two*, Three*',
  'One, Two*, Three*' => 'One et al.',
  'One**, Two**, Three' => 'One** et al.',
  'One*, Two**, Three' => 'One* et al.'
}
cases.each do |authors, expected|
  actual = template.render!('include' => {'authors' => authors})
  raise "#{authors.inspect}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
end
puts "#{cases.size} publication author cases passed"
