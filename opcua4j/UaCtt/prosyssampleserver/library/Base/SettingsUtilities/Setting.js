// Setting class to store CTT setting info.

/*globals readSetting */

function Setting()
{
    this.name = null;
    this.value = null;
}


// Read a given setting, storing info
Setting.prototype.read = function( settingName )
{
    this.name = settingName;
    this.value = readSetting( settingName );
    if( this.value !== undefined )
    {
        this.value = this.value.toString();
    }
};


// Static read: returns a new instance of Setting
Setting.read = function( settingName )
{
    var setting = new Setting();
    setting.read( settingName );
    return setting;
};


/*
var s = Setting.read( "/Server Test/Server URL" );
addLog( "" + s.name );
addLog( "" + s.value );

s = Setting.read( "/Server Test/Nada" );
addLog( "" + s.name );
addLog( "" + s.value );
*/