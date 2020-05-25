module.exports = (sequelize, DataTypes) => { 
    let model = sequelize.define('blacklist', { 
        bl_victim_us_id: { 
            type: DataTypes.INTEGER
        }, 
        bl_attacker_us_id: { 
            type: DataTypes.INTEGER
        },
        bl_us_email: {
            type: DataTypes.STRING(100)  
        },
        bl_content: {
            type: DataTypes.STRING(255)
        }
    }, 
    {
        tableName: "blacklist",
        timestamps: false
    }); 
    
    // Remove default primary Keys
    model.removeAttribute('id');
    
    return model;
    
}