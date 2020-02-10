@echo off

REM check for node
node --version >nul 2>&1 && (
    echo.
    REM Node installed
    echo --- node installed properly
    REM check for python
    python --version>nul 2>&1 && (
        echo.
        REM python installed
        echo --- python installed properly
        REM install npm dependencies
        CALL npm install --only=dev
        CALL npm install node-sass
        CALL pip install pipenv
        CALL pipenv install
        CALL pipenv install -r requirements.txt

        echo.
        echo --- dependencies installed... setting up local db environment
        START LocalDatabaseSetupFiles\localDatabaseSetup.bat
    ) || (
        REM python not installed
        echo.
        echo --- python not installed
        START "" https://www.python.org/downloads/
    )

) || (
    REM Node not installed
    REM check for python
    python --version>nul 2>&1 && (
        REM python installed
        echo --- nodejs is not installed.
        START "" https://nodejs.org/en/download/
    ) || (
        REM python not installed
        echo.
        echo --- nodejs is not installed.
        START "" https://nodejs.org/en/download/
        echo.
        echo --- python not installed
        START "" https://www.python.org/downloads/
    )
)