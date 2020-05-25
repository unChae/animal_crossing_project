module.exports = (sequelize, DataTypes) => { 
    let model = sequelize.define('chat', { 
        ch_id: { 
            type: DataTypes.STRING(255)
        }, 
        ch_bo_id: {
            type: DataTypes.INTEGER  
        },
        ch_send_us_id: {
            type: DataTypes.INTEGER
        },
        ch_receive_us_id: {
            type: DataTypes.INTEGER
        },
        ch_content: {
            type: DataTypes.STRING(255)
        }
    }, 
    {
        tableName: "chat",
        timestamps: true
    }); 

    // Remove default primary Keys
    model.removeAttribute('id');
    
    return model;
}