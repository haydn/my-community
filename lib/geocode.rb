#!/usr/bin/env ruby

require 'rubygems'
require 'geocoder'
require 'csv'
require 'pry'

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

CSV.open("communities_updated.csv", "wb") do |write|
  CSV.open("communities.csv", "r", headers: :first_row, header_converters: :symbol) do |read|
    write << read.first.headers
    read.find_all do |row|
      geolocation = find_geolocation(row[:address])
      row[:latitude]  = geolocation[:latitude]
      row[:longitude] = geolocation[:longitude]
      write << row
    end
  end
end
