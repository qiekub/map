# OpenAdvertMap
# Interactive map showing advertisement data from OpenStreetMap
# Author: Adrien PAVIE
#
# Makefile

# Folders
SRC_FOLDER=./src
DIST_FOLDER=./dist
TEST_FOLDER=./test
NM_FOLDER=./node_modules
IMG_FOLDER=$(SRC_FOLDER)/img

# Files
TEST_FILES = \
	$(TEST_FOLDER)/js/model/*.js

# Binaries
BROWSERIFY=$(NM_FOLDER)/browserify/bin/cmd.js
REWORKNPM=$(NM_FOLDER)/rework-npm-cli/index.js
UGLIFYCSS=$(NM_FOLDER)/uglifycss/uglifycss
UGLIFYJS=$(NM_FOLDER)/uglify-js-harmony/bin/uglifyjs
WATCHIFY=$(NM_FOLDER)/watchify/bin/cmd.js

# Options
BABELIFY_TRANSFORM=-t [ babelify --presets [ latest stage-0 ] ]

# Targets
CSS_OUT=$(DIST_FOLDER)/yohours.css
CSS_MIN_OUT=$(DIST_FOLDER)/yohours.min.css
DIST_ZIP=./dist.zip
MAIN_JS_OUT=$(DIST_FOLDER)/yohours.js
MAIN_JS_MIN_OUT=$(DIST_FOLDER)/yohours.min.js
TEST_JS=$(TEST_FOLDER)/unit_testing.js


# Tasks
all: deps assets jsdebug js distzip

deps:
	npm install
	sed -i "s/require('jquery')/$$/g" $(NM_FOLDER)/fullcalendar/dist/fullcalendar.js

assets: distfolder html images nm_assets css mincss

distfolder:
	mkdir -p $(DIST_FOLDER)

html:
	cp $(SRC_FOLDER)/*.html $(DIST_FOLDER)/
	cp $(SRC_FOLDER)/*.json $(DIST_FOLDER)/

images:
	mkdir -p $(DIST_FOLDER)/img
	cp $(SRC_FOLDER)/img/* $(DIST_FOLDER)/img/

nm_assets:
	cp -r $(NM_FOLDER)/bootstrap/dist/fonts $(DIST_FOLDER)/

css:
	$(REWORKNPM) $(SRC_FOLDER)/css/yohours.css -o $(CSS_OUT)
	sed -i 's#../fonts#fonts#g' $(CSS_OUT)

mincss:
	$(UGLIFYCSS) --ugly-comments $(CSS_OUT) > $(CSS_MIN_OUT)

jsdebug:
	$(BROWSERIFY) $(BABELIFY_TRANSFORM) $(SRC_FOLDER)/js/ctrl/Main.js --debug --s YoHours > $(MAIN_JS_OUT)

js:
	#$(BROWSERIFY) $(SRC_FOLDER)/js/ctrl/Main.js --s YoHours $(BABELIFY_TRANSFORM) | $(UGLIFYJS) -c > $(MAIN_JS_MIN_OUT)
	$(BROWSERIFY) $(SRC_FOLDER)/js/ctrl/Main.js --s YoHours $(BABELIFY_TRANSFORM) > $(MAIN_JS_OUT)

distzip:
	rm -f $(DIST_ZIP)
	zip -9 -r $(DIST_ZIP) $(DIST_FOLDER)/


# Tests
test: unittest

unittest:
	$(BROWSERIFY) --debug $(TEST_FILES) $(BABELIFY_TRANSFORM) > $(TEST_JS)


# Watch
watchmain:
	$(WATCHIFY) --debug $(SRC_FOLDER)/js/ctrl/Main.js -o $(MAIN_JS_OUT) --s YoHours -v $(BABELIFY_TRANSFORM)

watchunittest:
	$(WATCHIFY) --debug $(TEST_FILES) -o $(TEST_JS) -v $(BABELIFY_TRANSFORM)


# Cleaning
clean:
	rm -rf $(DIST_FOLDER)
	rm -f $(DIST_ZIP)
