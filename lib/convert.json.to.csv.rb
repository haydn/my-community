require 'csv'
require 'json'
require 'pry'

# CSV.open("test.csv", "w") do |csv|

  data = JSON.parse(File.open("gazetter_sa.json").read)
  
  data["features"].each do |hash|
    binding.pry
    hash["properties"].values if hash.is_a?(Hash) && hash.has_key?("properties")
  end    
  
# end
