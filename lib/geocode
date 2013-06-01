#!/usr/bin/env ruby

require 'rubygems'
require 'geocoder'
require 'csv'

if ARGV.empty? || ARGV.size < 2
  puts "Usage ./geocode input_file output_file"
  exit
end

def find_geolocation(address)
  geolocation = {}

  Geocoder::Configuration.timeout = 15
  result = Geocoder.search(address)

  if result[0]
    geolocation[:latitude] = result[0].latitude
    geolocation[:longitude] = result[0].longitude
  end

  return geolocation
end

current_directory = Dir.pwd
input_file  = File.join(current_directory, ARGV[0])
output_file = File.join(current_directory, ARGV[1])

CSV.open(output_file, "wb") do |write|
  CSV.open(input_file, "r", headers: :first_row, header_converters: :symbol) do |read|
    write << read.first.headers
    read.find_all do |row|
      geolocation = find_geolocation(row[:address])
      row[:latitude]  = geolocation[:latitude]
      row[:longitude] = geolocation[:longitude]
      write << row
      puts "#{row[:address]} -> { #{row[:latitude]}, #{row[:longitude]} }"
    end
  end
end
