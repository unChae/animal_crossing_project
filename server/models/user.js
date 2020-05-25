module.exports = (sequelize, DataTypes) => { 
    let model = sequelize.define('user', {
        us_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        us_email: {
            type: DataTypes.STRING(100),
            unique: true
        },
        us_password: {
            type: DataTypes.STRING(255)
        },
        us_thumbnail: { 
            type: DataTypes.STRING(100) 
        }, 
        us_nickname: { 
            type: DataTypes.STRING(100),
            defalutValue: "User"
        }, 
        us_islandname: { 
            type: DataTypes.STRING(100),
            defalutValue: "Island"
        }, 
        us_code: { 
            type: DataTypes.STRING(100)
        }, 
        us_grant: { 
            type: DataTypes.INTEGER, 
            defaultValue: 0
        }, 
        us_fcmtoken: { 
            type: DataTypes.STRING(255)
        },
        us_logintoken: { 
            type: DataTypes.STRING(255) 
        },
        us_access: {
            type: DataTypes.INTEGER,
            defalutValue: 0
        },
        us_access_token: {
            type: DataTypes.STRING(255)
        }
    }, 
    {
        tableName: "user",
        timestamps: false
    }); 
    
    return model;
}