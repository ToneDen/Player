#! bin/sh
cd loader && grunt $1
cd ..
cd sdk && grunt $1
