#!/usr/bin/env bash

GITHUB_URL=https://github.com/facebook/flow.git
DIRECTORY=_flow/
BIN_FILE=./flow

echo " ⚠️ ⚠️ ⚠️ ️️Warning, this script eats errors, use at your own risk, blah blah blah. ⚠️ ⚠️ ⚠️ ️"
echo ""
echo "📁  Working on directory: $DIRECTORY"

if [ -e $BIN_FILE ]; then
	echo -n "❌  $BIN_FILE exists, deleting!"
	rm -fr $BIN_FILE
	echo "  ✅"
fi

if [ -d $DIRECTORY ]; then
	echo -n "❌  $DIRECTORY exists, deleting!"
	rm -rf $DIRECTORY
	echo "  ✅"
fi


echo -n "⏬  Cloning git..." &&
git clone $GITHUB_URL $DIRECTORY  > /dev/null 2>&1 &&
echo "  ✅" &&
cd $DIRECTORY &&

echo -n "🔧  Making..." &&
make  > /dev/null  2>&1 &&
echo "  ✅" &&
cd .. &&
echo -n "💾  Creating bin file: $BIN_FILE" &&
echo "$DIRECTORY/bin/flow $@" > $BIN_FILE &&
chmod +x $BIN_FILE &&
echo "  ✅" &&

echo "👍  All done! $BIN_FILE is ready to be used."
