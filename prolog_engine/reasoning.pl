% ==========================================
% AGRIMIND AI - ADVANCED REASONING ENGINE
% ==========================================

:- consult('facts.pl').
:- consult('rules.pl').

% Recommend suitable crops
recommend_crops(Soil, Temp, Rain, PH, Fertility, Season, Crops) :-
    findall(Crop,
        crop_suitable(Crop, Soil, Temp, Rain, PH, Fertility, Season),
        Crops).

% Calculate score for every crop
all_crop_scores(Soil, Temp, Rain, PH, Fertility, Season, Results) :-
    findall(
        result(Crop, Score),
        (
            crop(Crop),
            crop_score(Crop, Soil, Temp, Rain, PH, Fertility, Season, Score)
        ),
        Results).

% Explain rejection reasons
get_rejection_reasons(Crop, Soil, Temp, Rain, PH, Fertility, Season, Reasons) :-
    findall(Reason,
        crop_rejection_reason(
            Crop, Soil, Temp, Rain, PH, Fertility, Season, Reason
        ),
        Reasons).

% Soil analysis
analyze_soil(Soil, Advice) :-
    soil_advice(Soil, Advice).

% pH analysis
analyze_ph(PH, Category) :-
    ph_advice(PH, Category).

% Fertility analysis
analyze_fertility(Fertility, Advice) :-
    fertility_advice(Fertility, Advice).

% Irrigation analysis
recommend_irrigation(Crop, Water, Level, Advice) :-
    irrigation_plan(Crop, Water, Level, Advice).

% Crop rotation
recommend_rotation(Previous, Crops) :-
    findall(Next, rotation_advice(Previous, Next), Crops).
