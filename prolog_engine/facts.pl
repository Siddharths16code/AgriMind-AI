% ==========================================
% AGRIMIND AI - EXTENDED KNOWLEDGE BASE
% ==========================================

crop(wheat).
crop(rice).
crop(maize).
crop(cotton).
crop(mustard).
crop(groundnut).

% Soil preferences
soil_preference(wheat, loamy).
soil_preference(wheat, clayey).
soil_preference(rice, clayey).
soil_preference(rice, loamy).
soil_preference(maize, loamy).
soil_preference(maize, sandy).
soil_preference(cotton, black).
soil_preference(cotton, loamy).
soil_preference(mustard, loamy).
soil_preference(mustard, sandy).
soil_preference(groundnut, sandy).
soil_preference(groundnut, loamy).

% Temperature ranges (Celsius)
temperature_range(wheat, 10, 30).
temperature_range(rice, 20, 35).
temperature_range(maize, 18, 35).
temperature_range(cotton, 21, 35).
temperature_range(mustard, 10, 25).
temperature_range(groundnut, 20, 35).

% Rainfall ranges (mm)
rainfall_requirement(wheat, 300, 900).
rainfall_requirement(rice, 1000, 2500).
rainfall_requirement(maize, 500, 1200).
rainfall_requirement(cotton, 500, 1200).
rainfall_requirement(mustard, 300, 700).
rainfall_requirement(groundnut, 500, 1000).

% Soil pH ranges
ph_range(wheat, 5.5, 7.5).
ph_range(rice, 5.0, 7.0).
ph_range(maize, 5.5, 7.5).
ph_range(cotton, 5.5, 8.0).
ph_range(mustard, 6.0, 7.5).
ph_range(groundnut, 5.5, 7.0).

% Water requirements
water_requirement(wheat, medium).
water_requirement(rice, high).
water_requirement(maize, medium).
water_requirement(cotton, medium).
water_requirement(mustard, low).
water_requirement(groundnut, medium).

% Relative fertility requirements
fertility_requirement(wheat, medium).
fertility_requirement(rice, high).
fertility_requirement(maize, medium).
fertility_requirement(cotton, medium).
fertility_requirement(mustard, low).
fertility_requirement(groundnut, low).

% Fertility level ordering
fertility_level(low, 1).
fertility_level(medium, 2).
fertility_level(high, 3).

% Broad growing seasons
season_suitable(wheat, rabi).
season_suitable(rice, kharif).
season_suitable(maize, kharif).
season_suitable(maize, rabi).
season_suitable(cotton, kharif).
season_suitable(mustard, rabi).
season_suitable(groundnut, kharif).

% Crop rotation rules
rotation_after(wheat, mustard).
rotation_after(wheat, maize).
rotation_after(rice, mustard).
rotation_after(rice, wheat).
rotation_after(maize, groundnut).
rotation_after(cotton, wheat).
rotation_after(mustard, maize).
rotation_after(groundnut, wheat).



% ==========================================
% NPK NUTRIENT KNOWLEDGE BASE
% ==========================================

% General crop nutrient demand profiles
% These are simplified relative demand categories.

crop_nutrient_need(wheat, nitrogen, high).
crop_nutrient_need(wheat, phosphorus, medium).
crop_nutrient_need(wheat, potassium, medium).

crop_nutrient_need(rice, nitrogen, high).
crop_nutrient_need(rice, phosphorus, medium).
crop_nutrient_need(rice, potassium, high).

crop_nutrient_need(maize, nitrogen, high).
crop_nutrient_need(maize, phosphorus, medium).
crop_nutrient_need(maize, potassium, medium).

crop_nutrient_need(cotton, nitrogen, high).
crop_nutrient_need(cotton, phosphorus, high).
crop_nutrient_need(cotton, potassium, high).

crop_nutrient_need(mustard, nitrogen, medium).
crop_nutrient_need(mustard, phosphorus, medium).
crop_nutrient_need(mustard, potassium, medium).

crop_nutrient_need(groundnut, nitrogen, low).
crop_nutrient_need(groundnut, phosphorus, medium).
crop_nutrient_need(groundnut, potassium, medium).
% ==========================================
% DETAILED CROP KNOWLEDGE PROFILES
% ==========================================

% Botanical families
crop_family(wheat, poaceae).
crop_family(rice, poaceae).
crop_family(maize, poaceae).
crop_family(cotton, malvaceae).
crop_family(mustard, brassicaceae).
crop_family(groundnut, fabaceae).

% Approximate crop duration in days
crop_duration(wheat, 120, 150).
crop_duration(rice, 110, 150).
crop_duration(maize, 90, 120).
crop_duration(cotton, 150, 180).
crop_duration(mustard, 100, 130).
crop_duration(groundnut, 100, 130).

% General crop water requirement
crop_water_need(wheat, medium).
crop_water_need(rice, high).
crop_water_need(maize, medium).
crop_water_need(cotton, medium).
crop_water_need(mustard, low).
crop_water_need(groundnut, medium).

% Main agricultural uses
crop_use(wheat, 'Major cereal crop used for flour, bread and food products').
crop_use(rice, 'Major staple cereal crop used as human food').
crop_use(maize, 'Used for food, animal feed and industrial products').
crop_use(cotton, 'Important fibre crop used in the textile industry').
crop_use(mustard, 'Oilseed crop used for edible oil and condiments').
crop_use(groundnut, 'Oilseed and food crop used for edible oil and protein-rich food').

% General agricultural characteristics
crop_benefit(wheat, 'Provides staple food and fits well into many cereal-based rotations').
crop_benefit(rice, 'Important staple food crop and can be integrated into diversified rotations').
crop_benefit(maize, 'Versatile crop with food, feed and industrial applications').
crop_benefit(cotton, 'Provides natural fibre and supports textile-related agriculture').
crop_benefit(mustard, 'Provides edible oil and can diversify cereal-based cropping systems').
crop_benefit(groundnut, 'A legume that can contribute to biological nitrogen fixation through effective root nodules').

% General crop management cautions
crop_caution(wheat, 'Avoid waterlogging and manage irrigation according to crop stage').
crop_caution(rice, 'Water management is important; avoid unnecessary water use').
crop_caution(maize, 'Avoid moisture stress during flowering and grain formation').
crop_caution(cotton, 'Monitor pests regularly and avoid excessive irrigation').
crop_caution(mustard, 'Avoid waterlogging and monitor moisture during flowering').
crop_caution(groundnut, 'Ensure suitable soil drainage and monitor disease during humid conditions').

% Crop rotation compatibility
% Legume-to-cereal rotation is generally beneficial
rotation_benefit(groundnut, wheat, 'Groundnut is a legume and can support soil nitrogen management before a cereal crop').
rotation_benefit(groundnut, maize, 'Legume-to-cereal rotation can improve cropping diversity and nutrient management').
rotation_benefit(groundnut, rice, 'A legume preceding rice can contribute to diversified nutrient management').

% Avoid repeating the same crop family where practical
same_crop_family_rotation(Crop1, Crop2) :-
    crop_family(Crop1, Family),
    crop_family(Crop2, Family),
    Crop1 \= Crop2.

