module.exports = (sequelize, DataTypes) => { 
    let model = sequelize.define('report', { 
        re_us_id: { 
            type: DataTypes.INTEGER, 
        }, 
        re_title: { 
            type: DataTypes.STRING(50)
        }, 
        re_content: {
            type: DataTypes.STRING(255)
        }
    }, 
    {
        tableName: "report",
        timestamps: false
    }); 
    
    // Remove default primary Keys
    model.removeAttribute('id');
    
    return model;
}