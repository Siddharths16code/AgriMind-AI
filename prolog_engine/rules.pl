% ==========================================
% AGRIMIND AI - ADVANCED DECISION RULES
% ==========================================

soil_suitable(Crop, Soil) :-
    soil_preference(Crop, Soil).

temperature_suitable(Crop, Temp) :-
    temperature_range(Crop, Min, Max),
    Temp >= Min,
    Temp =< Max.

rainfall_suitable(Crop, Rain) :-
    rainfall_requirement(Crop, Min, Max),
    Rain >= Min,
    Rain =< Max.

ph_suitable(Crop, PH) :-
    ph_range(Crop, Min, Max),
    PH >= Min,
    PH =< Max.

fertility_suitable(Crop, Fertility) :-
    fertility_requirement(Crop, Required),
    fertility_level(Fertility, ActualLevel),
    fertility_level(Required, RequiredLevel),
    ActualLevel >= RequiredLevel.

season_suitable_for(Crop, Season) :-
    season_suitable(Crop, Season).

% Six-factor crop suitability
crop_suitable(Crop, Soil, Temp, Rain, PH, Fertility, Season) :-
    crop(Crop),
    soil_suitable(Crop, Soil),
    temperature_suitable(Crop, Temp),
    rainfall_suitable(Crop, Rain),
    ph_suitable(Crop, PH),
    fertility_suitable(Crop, Fertility),
    season_suitable_for(Crop, Season).

% Count matching conditions
crop_score(Crop, Soil, Temp, Rain, PH, Fertility, Season, Score) :-
    findall(1,
        (
            (soil_suitable(Crop, Soil));
            (temperature_suitable(Crop, Temp));
            (rainfall_suitable(Crop, Rain));
            (ph_suitable(Crop, PH));
            (fertility_suitable(Crop, Fertility));
            (season_suitable_for(Crop, Season))
        ),
        Matches),
    length(Matches, Score).

% Explain why a crop does not satisfy a condition
crop_rejection_reason(Crop, Soil, _, _, _, _, _, soil_mismatch) :-
    crop(Crop),
    \+ soil_suitable(Crop, Soil).

crop_rejection_reason(Crop, _, Temp, _, _, _, _, temperature_mismatch) :-
    crop(Crop),
    \+ temperature_suitable(Crop, Temp).

crop_rejection_reason(Crop, _, _, Rain, _, _, _, rainfall_mismatch) :-
    crop(Crop),
    \+ rainfall_suitable(Crop, Rain).

crop_rejection_reason(Crop, _, _, _, PH, _, _, ph_mismatch) :-
    crop(Crop),
    \+ ph_suitable(Crop, PH).

crop_rejection_reason(Crop, _, _, _, _, Fertility, _, fertility_mismatch) :-
    crop(Crop),
    \+ fertility_suitable(Crop, Fertility).

crop_rejection_reason(Crop, _, _, _, _, _, Season, season_mismatch) :-
    crop(Crop),
    \+ season_suitable_for(Crop, Season).

% Soil advice
soil_advice(loamy, 'Loamy soil generally offers balanced drainage, aeration and moisture retention').
soil_advice(clayey, 'Clayey soil retains moisture. Proper drainage is important').
soil_advice(sandy, 'Sandy soil drains quickly. Organic matter may improve water retention').
soil_advice(black, 'Black soil retains moisture. Avoid waterlogging').

% Soil pH classification
ph_advice(PH, acidic) :-
    PH < 6.0.

ph_advice(PH, slightly_acidic) :-
    PH >= 6.0,
    PH < 6.5.

ph_advice(PH, neutral) :-
    PH >= 6.5,
    PH =< 7.5.

ph_advice(PH, alkaline) :-
    PH > 7.5.

% Fertility advice
fertility_advice(low, 'Low fertility: consider a soil test and improve organic matter and nutrient management').
fertility_advice(medium, 'Medium fertility: maintain soil organic matter and apply nutrients based on soil testing').
fertility_advice(high, 'High fertility: avoid unnecessary fertilizer application and monitor nutrient balance').

% Irrigation advice
irrigation_plan(Crop, low, critical, 'Water availability is limited for this crop. Plan efficient irrigation and monitor soil moisture') :-
    water_requirement(Crop, medium).

irrigation_plan(Crop, low, critical, 'This crop has high water requirements. A reliable irrigation source is essential') :-
    water_requirement(Crop, high).

irrigation_plan(Crop, low, suitable, 'Low water availability is generally compatible with this crop. Avoid unnecessary irrigation') :-
    water_requirement(Crop, low).

irrigation_plan(Crop, medium, suitable, 'Medium water availability is generally suitable. Use crop-stage-based irrigation') :-
    water_requirement(Crop, medium).

irrigation_plan(Crop, medium, caution, 'This crop has high water requirements. Monitor moisture and plan irrigation') :-
    water_requirement(Crop, high).

irrigation_plan(Crop, medium, suitable, 'Available water is generally sufficient. Irrigate only when required') :-
    water_requirement(Crop, low).

irrigation_plan(Crop, high, suitable, 'Water availability is sufficient. Avoid waterlogging and over-irrigation') :-
    water_requirement(Crop, high).

irrigation_plan(Crop, high, suitable, 'Water availability is sufficient. Avoid over-irrigation') :-
    water_requirement(Crop, medium).

irrigation_plan(Crop, high, caution, 'This crop needs relatively little water. Excess irrigation may waste water') :-
    water_requirement(Crop, low).

% Crop rotation
rotation_advice(Previous, Next) :-
    rotation_after(Previous, Next).



% ==========================================
% NPK NUTRIENT ADVISORY RULES
% ==========================================

nutrient_advice(nitrogen, low,
    'Nitrogen is reported as low. Review nitrogen management, organic matter and suitable nitrogen sources using a soil-test-based fertilizer plan').

nutrient_advice(nitrogen, medium,
    'Nitrogen is at a medium level. Maintain balanced nutrient management and avoid unnecessary nitrogen application').

nutrient_advice(nitrogen, high,
    'Nitrogen is reported as high. Avoid excessive nitrogen application and monitor crop growth and nutrient balance').

nutrient_advice(phosphorus, low,
    'Phosphorus is reported as low. Review phosphorus availability and suitable phosphorus sources based on soil testing').

nutrient_advice(phosphorus, medium,
    'Phosphorus is at a medium level. Maintain soil fertility and follow crop-specific nutrient recommendations').

nutrient_advice(phosphorus, high,
    'Phosphorus is reported as high. Avoid unnecessary phosphorus application and consider possible nutrient imbalance').

nutrient_advice(potassium, low,
    'Potassium is reported as low. Review potassium management and suitable potassium sources using soil-test recommendations').

nutrient_advice(potassium, medium,
    'Potassium is at a medium level. Maintain balanced potassium nutrition and monitor crop requirements').

nutrient_advice(potassium, high,
    'Potassium is reported as high. Avoid excessive potassium application and monitor nutrient balance').

% Crop-specific relative nutrient demand lookup
nutrient_demand(Crop, Nutrient, Demand) :-
    crop_nutrient_need(Crop, Nutrient, Demand).

% A nutrient is flagged for attention when soil status is low
nutrient_needs_attention(low).
% ==========================================
% CROP PROFILE REASONING
% ==========================================

crop_profile(Crop, Family, MinDays, MaxDays, Water, Use, Benefit, Caution) :-
    crop_family(Crop, Family),
    crop_duration(Crop, MinDays, MaxDays),
    crop_water_need(Crop, Water),
    crop_use(Crop, Use),
    crop_benefit(Crop, Benefit),
    crop_caution(Crop, Caution).

% ==========================================
% ADVANCED CROP ROTATION REASONING
% ==========================================

rotation_explanation(PreviousCrop, NextCrop, Explanation) :-
    rotation_benefit(PreviousCrop, NextCrop, Explanation).

rotation_explanation(PreviousCrop, NextCrop, Explanation) :-
    crop_family(PreviousCrop, Family1),
    crop_family(NextCrop, Family2),
    Family1 \= Family2,
    Explanation = 'The crops belong to different botanical families, which can help diversify the cropping system. Check local suitability before selection'.

rotation_explanation(PreviousCrop, NextCrop, Explanation) :-
    same_crop_family_rotation(PreviousCrop, NextCrop),
    Explanation = 'Both crops belong to the same botanical family. Consider disease, pest and nutrient-management risks before selecting this rotation'.

rotation_explanation(Crop, Crop, Explanation) :-
    Explanation = 'Growing the same crop repeatedly may increase pest, disease and nutrient-management risks. Consider crop diversification'.

% ==========================================
% CROP PROFILE VALIDATION
% ==========================================

known_crop(Crop) :-
    crop_family(Crop, _).


% ==========================================
% INTELLIGENT CROP ROTATION RANKING
% ==========================================

% Legume-to-cereal rotation receives an additional score.
rotation_benefit_score(PreviousCrop, NextCrop, 3) :-
    rotation_benefit(PreviousCrop, NextCrop, _),
    !.

rotation_benefit_score(_, _, 0).

% Different botanical families receive preference.
rotation_family_score(PreviousCrop, NextCrop, 2) :-
    crop_family(PreviousCrop, Family1),
    crop_family(NextCrop, Family2),
    Family1 \= Family2,
    !.

rotation_family_score(_, _, 0).

% Calculate overall rotation score.
rotation_score(PreviousCrop, NextCrop, Score) :-
    known_crop(PreviousCrop),
    known_crop(NextCrop),
    PreviousCrop \= NextCrop,
    rotation_benefit_score(PreviousCrop, NextCrop, BenefitScore),
    rotation_family_score(PreviousCrop, NextCrop, FamilyScore),
    Score is BenefitScore + FamilyScore.

