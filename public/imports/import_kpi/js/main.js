
function extractEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}
Vue.component('edit-import-kpi-modal', {
    delimiters: ['${', '}$'],
    props: ['kpi', 'showmodal'],
    template: $('#edit-import-kpi-modal').html(),
    data: function () {
        return {
            data_edit_kpi: {},
            showmodal: false,
                list_kpi_id: ['f', 'c', 'p', 'l', 'o'],
            method: ["sum", "average", "most_recent", "tính tổng", "trung bình", "tháng gần nhất"],
        }
    },
    mounted: function () {
        // {#            console.log(this.showmodal)#}
        // {#            this.old_data = this.kpi#}
    },
    created: function () {
        // {#            console.log("======><><><><><><><kpppppppppppppppppppppppi><><><><><><><<><=======")#}
        // {#            this.edit_target_data = this.kpi#}
    },
    watch: {
        kpi: {
            handler: function (newVal, oldVal) {
                // {#                    console.log("triggered change kpi object")#}
                // {#                    console.log(newVal)#}
                    this.data_edit_kpi = JSON.parse(JSON.stringify(newVal))
            },
            deep: true
        },
        showmodal: function (val) {
            this.showmodal = val
        },
        extractEmails: function (email) {
            if (email) {
                return /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi.test(email);
            }
            return false;
        },

    },
    beforeDestroy: function () {
        //            this.$off('dismiss')
    },
    methods: {
        triggeredCloseModal: function () {
                var self = this
                self.$emit('dismiss')
        },
        check_format_operator: function (_operator) {
            var operator = ['<=', '>=', '='];
            return operator.indexOf(_operator) == -1;
        },
        to_string: function (value) {
            return value != null ? value.toString() : null;
        },
        trigger_confirm_edit_kpi: function () {
            var self = this
                self.$emit('comfirm',self.data_edit_kpi)
        },
        check_kpi_id_error: function (value) {
            try {
                value = value.trim()
            } catch (err) {
            }
            if (value && this.list_kpi_id.indexOf(value[0].toLowerCase()) == -1){
                return true
            }else if( value && value.slice(1, value.length).length >0){
                var end_code_kpi_id = value.slice(1, value.length)
                var res = end_code_kpi_id.split(".");
                var is_kpi_id = res.reduce(function(prevVal, element){
                    if(isFinite(element) && res.indexOf("")== -1){
                        return true
                    }else {
                        return false
                    }
                },false)
                if(!is_kpi_id){
                    return true
                }
            }else {
                return false
            }
        },
        check_number: function(e){
            var _number = String.fromCharCode(e.keyCode);
            if ('0123456789.'.indexOf(_number) !== -1) {
                return _number;
            }
            e.preventDefault();
            return false;
        },
        check_paste: function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
        },
        valid_change: function (obj, prop) {
            var val = parseFloat(obj[prop]);
            if (isNaN(val)) {
                Vue.set(obj, prop, null);
            } else {
                Vue.set(obj, prop, val);
            }
        },
    }
})

const Home = {
// {#                    template: '#home-template',#}
el: '#home-template',
    //  template : "<div>abc</div>",
    mounted: function(){
    var self = this;
    window.import_app = this;
    /*
    * Quick hack
    * */



    /* end quick hack */
},
data: function () {
    return {
        infor_msg_box:{
            show_infor_msg: false,
            type_msg:'',//success or error
            tite_msg:'',// thêm kpi thất bại
            array_msg:[]// [mã kpi quá 100 ký tư, mục tiêu kpi quá 300 ký tự]
        },
        enable_allocation_target:  false,
        alert_import_kpi: true,
        id_row_error: [],
        kpis: [],
        workbook: {},
        is_error: false,
        error_add: '',
        check_error_upload: false,
        check_file: true,
        dialogFormVisible: false,
        data_edit_kpi: {
            data: {},
            index: -1,
            check_error: false,
            msg: ""
        },
        organization:{},
        file: {},
        check_total: 0,
        method: ["sum", "average", "most_recent", "tính tổng", "trung bình", "tháng gần nhất"],
        method_save: '',

    }
},
filters: {
    trans_method: function(str){
        if(str=='sum'){
            return gettext('sum');
        }
        if(str=='average'){
            return gettext('average');
        }
        if(str=='most_recent'){
            return gettext('most_recent');
        }
        return str;
    },

},
methods: {
        triggeredDismissModal: function(){
            // console.log('triggered show modal')
            this.dialogFormVisible = false
        },
    hideUnusedTableHead: function(){
        console.log("triggered this hiding function")
        setTimeout(function(){
            $($('#import-kpi-page > div:nth-child(3) > div.tb-import-kpi > div > div.el-table__fixed > div.el-table__fixed-header-wrapper > table > thead > tr:nth-child(1) > th.el-table__expand-column.is-leaf').siblings('th')[0]).attr('colspan',2)
            $('#import-kpi-page > div:nth-child(3) > div.tb-import-kpi > div > div.el-table__fixed > div.el-table__fixed-header-wrapper > table > thead > tr:nth-child(1) > th.el-table__expand-column.is-leaf').hide()
        },100)
    },
    getOrg: function () {
            self = this;
            cloudjetRequest.ajax({
                method: "GET",
                url: "/api/organization",
                success: function (data) {
                    if (data) {
                        self.organization = data;
                        self.enable_allocation_target = data.enable_require_target
                    }
                },
                error: function () {
                }
            });
        },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
            return [0, 0];
        } else if (columnIndex === 1) {
            return [1, 2];
        }
    },

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
            if (rowIndex % 2 === 0) {
                return {
                    rowspan: 2,
                    colspan: 1
                };
            } else {
                return {
                    rowspan: 0,
                    colspan: 0
                };
            }
        }
    },

    tableRowClassName: function ({row, rowIndex}) {
        var self = this
        var classText = "";
        if (self.id_row_error.indexOf(row._uuid) !== -1) {
            classText += "warning-row ";
        }
        return classText;
    },
    slice_character: function(str){
        if(str.trim()[0]=='\n') {
            str=str.slice(1,str.length-1);
            return str.charAt(1).toUpperCase() + str.slice(2);
        }
        str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
        return str;
    },
    trans_method: function(str){
         if(str=='sum'){
            return gettext('sum');
        }
        if(str=='average'){
            return gettext('average');
        }
        if(str=='most_recent'){
            return gettext('most_recent');
        }
        return str;
    },
    trigger_close_msg_box: function(){
        // reset infor msg box
        var self = this
        var msg_box = {
            show_infor_msg: false,
            type_msg:'',
            tite_msg:'',
            array_msg:[]
        }
        self.infor_msg_box = Object.assign(self.infor_msg_box, msg_box)
    },
    handleDropFile: function (e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files;
        if (!files[0].type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            swal(gettext('Error'), gettext("Please choose the document format excel file") + "!", "error");
            $("#file-upload-form")[0].reset();
            return;
        }
        this.handleFile(e);
    },
    handleFile: function (e) {
         var that = this;
        that.kpis.length = 0;
        that.check_file = true;
        var files = e.target.files || e.dataTransfer.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            var name = f.name;
            var re = /(\.xlsx|\.xls)$/i;
            if (!re.exec(name)) {
                swal(gettext('Error'), gettext("Please choose the document format excel file") + "!", "error");
            }
            else {
                that.file = f;
                reader.onload = function (e) {
                    var data = e.target.result;

                    var workbook = XLSX.read(data, {type: 'binary'});

                    /* DO SOMETHING WITH workbook HERE */
//                                        console.log(workbook);

                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    var A = sheet.C1;

                    if (A == undefined || sheet.AA1 == undefined || sheet.AE1 != undefined) {
                        swal(gettext('Warning'), gettext("Data is incorrect, please re-check and make sure that template of file is in correct form. Data needs to be input from second line") + "!", "warning");
                        sheet = null;
                        that.check_error_upload = false;
                    } else {
                        $('body').loading({
                            stoppable: true,
                            message: gettext("Loading...")
                    });
                        setTimeout(function () {
                            var i = 2;
                            var last_goal_index = 2;
                            var last_goal = "";
                            that.check_error_upload = true;
                            while (A != undefined) {
                                try {

                                    try {
                                        var kpi_id = sheet["A" + i].w;
                                    } catch (err) {
                                        var kpi_id = '';
                                    }

                                    var goal = '';
                                    try {
                                        goal = sheet["B" + i].w;

                                        if (goal != undefined) {

                                            goal = goal.toUpperCase();
                                        }

                                    } catch (err) {

                                    }
                                    var check_goal = "";


                                    var kpi = '';
                                    try {
                                        kpi = sheet["C" + i].w;
                                    } catch (err) {

                                        last_goal_index = i;
                                    }

                                    if (kpi.trim().length != 0 && (goal == undefined || goal == '')) {

                                        if (last_goal == "") {
                                            throw "KPI Goal is missing";
                                        }
                                        else {
                                            console.log(kpi);
                                            goal = last_goal;
                                            check_goal = "Check goal"
                                        }
                                    } else {
                                        last_goal = goal;
                                    }


                                    try {
                                        var unit = sheet["D" + i].w;
                                    } catch (err) {
                                        var unit = '';
                                    }


                                    try {
                                        var measurement = sheet["E" + i].w;
                                    } catch (err) {
                                        var measurement = '';
                                    }

                                    try {
                                        var datasource = sheet["F" + i].w;
                                    } catch (err) {
                                        var datasource = '';
                                    }

                                    try {
                                        var method = sheet["G" + i].w;
                                    } catch (err) {
                                        var method = '';
                                    }

                                    try {
                                        var operator = sheet["H" + i].w;
                                    } catch (err) {
                                        var operator = '';
                                    }


                                    try {
                                        var year = sheet["I" + i].w;
                                    } catch (err) {
                                        var year = '';
                                    }


                                    try {
                                        var t1 = sheet["J" + i].w;
                                    } catch (err) {
                                        var t1 = '';
                                    }


                                    try {
                                        var t2 = sheet["K" + i].w;
                                    } catch (err) {
                                        var t2 = '';
                                    }


                                    try {
                                        var t3 = sheet["L" + i].w;
                                    } catch (err) {
                                        var t3 = '';
                                    }


                                    try {
                                        var q1 = sheet["M" + i].w;
                                    } catch (err) {
                                        var q1 = '';
                                    }

                                    try {
                                        var t4 = sheet["N" + i].w;
                                    } catch (err) {
                                        var t4 = '';
                                    }

                                    try {
                                        var t5 = sheet["O" + i].w;
                                    } catch (err) {
                                        var t5 = '';
                                    }

                                    try {
                                        var t6 = sheet["P" + i].w;
                                    } catch (err) {
                                        var t6 = '';
                                    }

                                    try {
                                        var q2 = sheet["Q" + i].w;
                                    } catch (err) {
                                        var q2 = '';
                                    }

                                    try {
                                        var t7 = sheet["R" + i].w;
                                    } catch (err) {
                                        var t7 = '';
                                    }

                                    try {
                                        var t8 = sheet["S" + i].w;
                                    } catch (err) {
                                        var t8 = '';
                                    }

                                    try {
                                        var t9 = sheet["T" + i].w;
                                    } catch (err) {
                                        var t9 = '';
                                    }

                                    try {
                                        var q3 = sheet["U" + i].w;
                                    } catch (err) {
                                        var q3 = '';
                                    }

                                    try {
                                        var t10 = sheet["V" + i].w;
                                    } catch (err) {
                                        var t10 = '';
                                    }

                                    try {
                                        var t11 = sheet["W" + i].w;
                                    } catch (err) {
                                        var t11 = '';
                                    }

                                    try {
                                        var t12 = sheet["X" + i].w;
                                    } catch (err) {
                                        var t12 = '';
                                    }

                                    try {
                                        var q4 = sheet["Y" + i].w;
                                    } catch (err) {
                                        var q4 = '';
                                    }

                                    try {
                                        var weight = sheet["Z" + i].w;
                                    } catch (err) {
                                        var weight = '';
                                    }


                                    try {
                                        var email = extractEmails(sheet["AA" + i].w)[0];
                                    } catch (err) {
                                        var email = '';
                                    }
                                    try {
                                        var code = sheet["AD" + i].w;
                                    } catch (err) {
                                        var code = '';
                                    }





                                    // <check-duplicated>

                                    // {#                                                    var duplicated_codes = that.kpis.filter(function (item) {#}
                                    //     {#                                                        return item.code.toLowerCase().trim() == code.toLowerCase().trim()#}
                                    //     {#                                                    });#}
                                    // {#                                                    if (code != "" && duplicated_codes.length > 0) {#}
                                    //     {#                                                        throw "Duplicated Code";#}
                                    //     {#                                                    }#}

                                    // </check-duplicated>
                                    that.kpis.push({
                                        "code": code,
                                        "kpi_id": kpi_id,
                                        "check_goal": check_goal,
                                        "goal": goal,
                                        "kpi": kpi,
                                        "unit": unit,
                                        "measurement": measurement,
                                        "score_calculation_type": method,
                                        "operator": operator,
                                        "t1": t1,
                                        "t2": t2,
                                        "t3": t3,
                                        "t4": t4,
                                        "t5": t5,
                                        "t6": t6,
                                        "t7": t7,
                                        "t8": t8,
                                        "t9": t9,
                                        "t10": t10,
                                        "t11": t11,
                                        "t12": t12,
                                        "q1": q1,
                                        "q2": q2,
                                        "q3": q3,
                                        "q4": q4,
                                        'year': year,
                                        "weight": weight.replace('%',''),
                                        "email": email,
                                        "check_error_year": false,
                                        "check_error_quarter_1": false,
                                        "check_error_quarter_2": false,
                                        "check_error_quarter_3": false,
                                        "check_error_quarter_4": false,
                                        "index": "",
                                        "msg":"",
                                        "_uuid": makeid()


                                    });
                                    console.log(that.kpis);
                                } catch (err) {
                                    that.is_error = true;
                                    that.kpis.push({
                                        "code": "[Error on line: " + i + "] > " + err

                                    });

                                }
                                i += 1;

                                A = sheet["C" + i];
                                if (A == undefined) {
                                    A = sheet["D" + i];
                                }
                                if (A == undefined) {
                                    A = sheet["C" + (i + 1)];
                                }
                                if (A == undefined) {
                                    A = sheet["D" + (i + 1)];
                                }
                            }
                            async.waterfall(
                                that.kpis.forEach(function (kpi, index) {
                                    kpi.index = index
                                    kpi = that.validate_kpi(kpi);
                                    // that.$set(that.kpis, index, kpi);
                                    return kpi
                                })
                            )
                            that.hideUnusedTableHead()

                        }, 200);
                    }
                    setTimeout(function () {
                        $('body').loading('stop');

                    }, 1000)
                    //that.workbook = workbook;
                    //;
                };
                reader.readAsBinaryString(f);
            }
        }
        $("#file-upload-form, #upload-form")[0].reset();
    },
    addRowError: function(uuid){
        var self = this;
        if(self.id_row_error.indexOf(uuid) === -1){
            self.id_row_error.push(uuid)
        }else{
            // not thing
        }
        self.$set(self,'id_row_error',self.id_row_error)
    },
    removeRowError: function(uuid){
        console.log(uuid)
        console.log("hell index here")
        var self = this;
        if(self.id_row_error.indexOf(uuid) !== -1){
            self.id_row_error.splice(self.id_row_error.indexOf(uuid),1)
        }else{
            //not thing
        }
        self.$set(self,'id_row_error',self.id_row_error)
    },

    extractEmails: function (email) {
        if (email) {
            return /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi.test(email);
        }
        return false;
    },
    init: function () {

         var that = this;
        that.getOrg()

        //  document.getElementById('drop').addEventListener('drop', that.handleDrop, false);


    },
    check_add_all: function () {
        var count = 0;
        var that = this
        for (var i = 0; i < that.kpis.length; i++) {
            if (kpis[i].msg) return false;
            if (kpis[i].status == 'success') count++;
        }
        return count == that.kpis.length ? false : true;
    },
    checkValidate: function(kpi,sum_q,totalQuarterArray,sum_year){
        var self = this;
        // Initialize pre condition

        var quarterNeedTocheckSample = [1,2,3,4]
        // {#                            var intQuarterNumber = parseInt(quarterNumber)#}
        var quarterNeedToCheck = []

        // Process conditions

        // year target bang voi tong target cac quy
        var year_target_input = !$.isNumeric(kpi.year) ? null : parseFloat(kpi.year).toFixed(15)
        year_target_input = parseFloat(year_target_input) || null
        sum_q = !$.isNumeric(sum_q) ? null : parseFloat(sum_q).toFixed(15)
        sum_q = parseFloat(sum_q) || null
        var yearTargetValid =  kpi.year == sum_q
        if(!yearTargetValid){
            kpi.check_error_year = true
        }
        //bao loi khi thang khong theo phuong phap phan quy
        for(var i = 1;i<5; i++){
            var quarter_target_input = !$.isNumeric(kpi['q' + i]) ? null : parseFloat(kpi['q' + i]).toFixed(15)
            quarter_target_input = parseFloat(quarter_target_input) || null
            totalQuarterArray[i - 1] = !$.isNumeric(totalQuarterArray[i - 1]) ? null : parseFloat(totalQuarterArray[i - 1]).toFixed(15)
            totalQuarterArray[i - 1] = parseFloat(totalQuarterArray[i - 1]) || null
            if (!(quarter_target_input == totalQuarterArray[i - 1])) {
                kpi['check_error_quarter_' + i] = true
            }
        }
        var quarterSumsIsNotNull = totalQuarterArray.reduce(function(prevVal,element){
            return prevVal && element === null
        },true)
        if (quarterSumsIsNotNull){
            kpi.check_error_year = false
        }
        return kpi
    },
    // validateIsSumQuarter: function (kpi,sum_p,totalQuarterArray,sum_year) {//sum_q1,sum_q2,sum_q3,sum_q4 or average_q1,average_q2,average_q3,average_q4
    //     var self = this;
    //     return kpi = self.checkValidate(kpi,sum_p,totalQuarterArray,sum_year)
    // },
    // validateIsMostRecent: function (kpi,most_recent_q,totalQuarterArray,sum_year) {
    //     var self = this;
    //     return kpi = self.checkValidate(kpi,most_recent_q,totalQuarterArray,sum_year)
    // },
    // validateIsAverage: function (kpi,average_q,totalQuarterArray,sum_year) {
    //     var self = this;
    //     return kpi = self.checkValidate(kpi,average_q,totalQuarterArray,sum_year)
    // },
    calculationScore: function(score){
        var self = this
        var year = score.year
        var total_quarter =[]
        var count_1 = 0
        var count_2 = 0
        var data_quarter = []
        var all_quarter_array = []
        for (var i =1; i<5;i++){
            data_quarter[i] = {}
            all_quarter_array[i] = $.isNumeric(score['q' + i])?parseFloat(score['q' + i]):null
            data_quarter[i]['month_1'] = $.isNumeric(score['t' + ((i -1)*3 + 1)])?parseFloat(score['t' + ((i -1)*3 + 1)]):null
            data_quarter[i]['month_2'] = $.isNumeric(score['t' + ((i -1)*3 + 2)])?parseFloat(score['t' + ((i -1)*3 + 2)]):null
            data_quarter[i]['month_3'] = $.isNumeric(score['t' + ((i -1)*3 + 3)])?parseFloat(score['t' + ((i -1)*3 + 3)]):null
        }
        total_quarter[0] = calculateYearTotal(all_quarter_array)
        for(var i = 1; i < 5; i ++){
            total_quarter[i] = calculationQuarterTotal(data_quarter[i])
        }
        var total_year = total_quarter.slice().reduce(function (preVal,element) {
            if(element.sum != null){
                return preVal + element.sum
            }
            return preVal
        }, null)
        total_quarter.push(total_year)
        console.log(total_quarter)
        return total_quarter


    },
    validateTargetScoreFollowAllocationTarget: function (kpi) {
        // Hàm này chỉ chạy khi hệ thống có bật Ràng buộc chỉ tiêu tháng/quý/năm theo phương pháp đo
        var self = this
        var check_score_calculation_type = true
        var p = self.method.indexOf(kpi.score_calculation_type.trim().toLowerCase());
        if (p > 2 & p<6){
            self.method_save = self.method[p-3];
        }else if( 0 <= p && p<=2){
            self.method_save = self.method[p];
        }
        else{
            self.method_save = "";
            check_score_calculation_type = false
        }
        kpi.score_calculation_type = self.method_save;
        var total_quarter_array = self.calculationScore(kpi)
        var sum_year = total_quarter_array[5]
        if(check_score_calculation_type){
            switch (kpi.score_calculation_type) {
                case "sum":
                    var sum_quarter = total_quarter_array[0].sum
                    var sum_month_follow_quarter_array = [total_quarter_array[1].sum,total_quarter_array[2].sum,total_quarter_array[3].sum,total_quarter_array[4].sum]
                    // par_1 là quarter_1 + quarter_2 + quarter_3 + quarter_4
                    // par_2 là array tông [sum_quarter_1,sum_quarter_2,sum_quarter_3,sum_quarter_4] với sum_quarter_1 = month_1 +month_2 + month_3
                    // par_3 tổng 12 tháng + 4 quý
                    return kpi = self.checkValidate(kpi,sum_quarter,sum_month_follow_quarter_array,sum_year)
                    break;
                case "most_recent":
                    var most_recent_quarter = total_quarter_array[0].most_recent_quarter;
                    var most_recent_month_follow_quarter_array = [total_quarter_array[1].most_recent_quarter,total_quarter_array[2].most_recent_quarter,total_quarter_array[3].most_recent_quarter,total_quarter_array[4].most_recent_quarter]
                    // par_1 là quý có input gần nhất
                    // par_2 là array các quý lấy tháng có input gần nhất
                    // par_3 tổng 12 tháng + 4 quý
                    return kpi = self.checkValidate(kpi,most_recent_quarter,most_recent_month_follow_quarter_array,sum_year)
                    break;
                case "average":
                    var average_quarter = total_quarter_array[0].average;
                    var average_month_follow_quarter_array = [total_quarter_array[1].average,total_quarter_array[2].average,total_quarter_array[3].average,total_quarter_array[4].average]
                    // par_1 là trung binh các quý có input
                    // par_2 là array các quý lấy trung binh các tháng
                    // par_3 tổng 12 tháng + 4 quý
                    return kpi = self.checkValidate(kpi,average_quarter,average_month_follow_quarter_array,sum_year)
                    break;
                default:
            }
        }
        return kpi
    },
    validate_kpi: function (kpi) {
        var self = this
        var operator = ['<=', '>=', '='];
        var scores = ['q1', 'q2', 'q3', 'q4'];
        var months = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12']
        var list_kpi_id = ['f', 'c', 'p', 'l', 'o']
        if (kpi.index == undefined) {
            return kpi;
        }
        if (self.enable_allocation_target){
            kpi = that.validateTargetScoreFollowAllocationTarget(kpi)
        }
        kpi.weight = kpi.weight.toString()
        if(!kpi.score_calculation_type){
            kpi.score_calculation_type = ""
        }
        if(!kpi.code){
            kpi.code = ""
        }
        if(!kpi.kpi_id){
            kpi.kpi_id = ""
        }
        if(!kpi.unit){
            kpi.unit = ""
        }
        if(!kpi.measurement){
            kpi.measurement = ""
        }
         if(!kpi.goal){
            kpi.goal = ""
        }
        if(!kpi.kpi){
            kpi.kpi = ""
        }
        if(!kpi.operator){
            kpi.operator = ""
        }
        kpi.msg = '';
        self.check_file = true;
        var quarter_error = [];// mảng lưu quý bị lỗi
        var months_error = [];// mảng lưu tháng bị lỗi

        cloudjetRequest.ajax({
            type: "POST",
            url: '/api/kpis/import/validate',
            data: JSON.stringify(kpi),
            success: function (responseJSON, textStatus) {
                // console.log('yes, we can!');
                // router.push('/');
                kpi.status = null;
                if (responseJSON['status'] == 'ok') {
                    kpi.validated = true;
                    kpi.status = responseJSON['status'];
                    if (kpi.code.trim()==''){
                        kpi.validated = false;
                        kpi.msg = kpi.msg + "\n" +gettext("Code must not be empty");
                    }
                    if (kpi.msg.trim()[0] == '\n') {
                        kpi.msg = kpi.msg.slice(2, kpi.msg.length);
                        kpi.msg = kpi.msg.charAt(0).toUpperCase() + kpi.msg.slice(1);
                    }
                } else {
                    kpi.status = responseJSON['status'];
                    kpi.validated = false;
                    kpi.msg = responseJSON['message'];
                    self.check_file = false;
                    if (kpi.code.trim()==''){
                        kpi.validated = false;
                        kpi.msg = kpi.msg + "\n" +gettext("Code must not be empty");
                    }
                }
                if (kpi.unit.trim()==''){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Unit is not formatted correctly");
                }
                if (kpi.kpi_id.trim()==''){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" +gettext("Type must not be empty");
                }
                if (kpi.kpi_id.trim() && list_kpi_id.indexOf(kpi.kpi_id.trim()[0].toLowerCase()) == -1){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + "Loại KPI không đúng"
                }else if( kpi.kpi_id.trim() && kpi.kpi_id.trim().slice(1, kpi.kpi_id.trim().length).length >0){
                    var end_code_kpi_id = kpi.kpi_id.trim().slice(1, kpi.kpi_id.trim().length)
                    var res = end_code_kpi_id.split(".");
                    var is_kpi_id = res.reduce(function(prevVal, element){
                        if(isFinite(element) && res.indexOf("")== -1){
                            return true
                        }else {
                            return false
                        }
                    },false)
                    if(!is_kpi_id){
                       kpi.msg = kpi.msg + "\n" + "Loại KPI không đúng"
                    }
                }
                if (kpi.measurement.trim()==''){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Measurement must not empty");
                }

                if (operator.indexOf(kpi.operator) == -1 && kpi.operator) {
                    kpi.msg = kpi.msg + "\n" + gettext("Operator format is not correct");
                }
                if (self.method.indexOf(kpi.score_calculation_type.trim().toLowerCase()) == -1){
                    kpi.validated = false;
                    kpi.status = responseJSON['status'];
                    self.check_file = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Score calculation type format is not correct");
                }
                kpi.year = kpi.year == null? kpi.year : kpi.year.toString().replace(/,/g, '')
                if (isNaN(kpi.year) ) {
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + "Điểm năm" + " không đúng định dạng";
                }
                scores.forEach(function (score) {
                    kpi[score] = kpi[score]== null?kpi[score]:kpi[score].toString().replace(/,/g, '')
                    if (isNaN(kpi[score])) {
                        quarter_error.push(scores.indexOf(score)+1)
                    }
                })
                months.forEach(function (month) {
                    kpi[month] = kpi[month]== null?kpi[month]:kpi[month].toString().replace(/,/g, '')
                    if (isNaN(kpi[month])) {
                        months_error.push(months.indexOf(month)+1)
                    }
                })
                if (quarter_error.length > 0 ) {
                    kpi.validated = false;
                    var quarter_error_str = quarter_error.join(', ') + " " + "không đúng định dạng";
                    kpi.msg = kpi.msg + "\n" + "Điểm quý" + " " + quarter_error_str;
                }
                if (months_error.length > 0 ) {
                    kpi.validated = false;
                    var months_error_str = months_error.join(', ') + " " + "không đúng định dạng";
                    kpi.msg = kpi.msg + "\n" + "Điểm tháng" + " " + months_error_str;
                }

                if (self.enable_allocation_target){
                    kpi = self.validateTargetScoreFollowAllocationTarget(kpi)
                }
                kpi.weight = kpi.weight == null?kpi.weight :kpi.weight.replace(/,/g, '.');
                if (isNaN(parseFloat(kpi.weight)) && kpi.weight) {
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" +gettext("Weights are not formatted correctly");
                }
                if (parseFloat(kpi.weight) <= 0) {
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" +gettext("Weight must be greater than 0");
                }
                if (kpi.check_error_year == true){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" +gettext("Year must be follow score calculation type");
                }
                if (kpi.check_error_quarter_1 == true){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Quarter 1 must be follow score calculation type");
                }
                if (kpi.check_error_quarter_2 == true){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Quarter 2 must be follow score calculation type");
                }
                if (kpi.check_error_quarter_3 == true){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" +gettext("Quarter 3 must be follow score calculation type");
                }
                if (kpi.check_error_quarter_4 == true){
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Quarter 4 must be follow score calculation type");
                }
                if (kpi.kpi === '') {
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("Name must not be empty");
                }
                if (kpi.goal == "") {
                    kpi.validated = false;
                    kpi.msg = kpi.msg + "\n" + gettext("KPI targets must not be empty");
                }
                if (kpi.msg.trim() == '\n') {
                    kpi.msg = kpi.msg.slice(2, kpi.msg.length);
                    kpi.msg = kpi.msg.charAt(0).toUpperCase() + kpi.msg.slice(1);
                }
                // console.log("===============xxxxxxxxx============")
                // console.log(kpi.msg)
                if(kpi.msg !== ''){
                    self.addRowError(kpi._uuid)
                }else{
                    self.removeRowError(kpi._uuid)
                }
                //self.$set(self.kpis, index, kpi);
                //self.$set(self.data_edit_kpi, 'msg', kpi.msg);
                try{
                    // auto scroll to error messages
                    setTimeout(function(){
                        $('.modal-body').scrollTo($('small.error').closest('.content'))
                    },200)
                }catch(err){

                }
                self.$set(that.data_edit_kpi, 'data', kpi)
                return kpi

            },
            error: function (jqXHR, textStatus) {
                kpi.status = message_request;
                kpi.msg = null;
                try {
                    kpi.msg = "Validate failed: " + jqXHR.responseJSON['message'];
                    self.check_file = false;
                } catch (err) {
                }
                if(kpi.msg !== ''){
                    self.addRowError(kpi._uuid)
                }else{
                    self.removeRowError(kpi._uuid)
                }
                return kpi
                // that.$set(that.kpis, index, kpi);
            },
            complete: function (data) {
                self.check_total++;
                if (self.check_total == self.kpis.length) {
                    setTimeout(function () {
                        $('body').loading('stop');
                        self.check_total = 0;
                    }, 1000)
                }
            },

            contentType: "application/json"

        });
        //self.$set(self.kpis, index, kpi);
    },
    to_string: function (value) {
        return value != null ? value.toString() : null;
    },
    check_kpi_child: function (code) {
        return code.indexOf('.') != -1;
    },
    check_format_operator: function (_operator) {
        var operator = ['<=', '>=', '='];
        return operator.indexOf(_operator) == -1;
    },
    edit_kpi: function (index) {
        var that = this;
        that.data_edit_kpi.check_error = false;
        that.data_edit_kpi.msg = that.kpis[index].msg;
        that.data_edit_kpi.data = JSON.parse(JSON.stringify(that.kpis[index]));
        console.log(that.data_edit_kpi.data)
        if (that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase() == '' || that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase()=='most recent'){
            // {#that.data_edit_kpi.data.score_calculation_type = 'most_recent';#}
        }
        else if (that.method.indexOf(that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase())>-1){
            that.method_save = that.data_edit_kpi.data.score_calculation_type;
            var p = that.method.indexOf(that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase());
            if(p > 2 && p<6){
                that.data_edit_kpi.data.score_calculation_type = that.method[p-3];
            }
            else if(0 <= p && p<=2){
                that.data_edit_kpi.data.score_calculation_type = that.method[p];
            }else {
                that.data_edit_kpi.data.score_calculation_type = ""
            }
        }
        if (parseFloat(that.data_edit_kpi.data.weight) != NaN) {
            that.data_edit_kpi.data.weight = parseFloat(that.data_edit_kpi.data.weight);
        }
        that.data_edit_kpi.index = index;
        console.log("======>>>>>>>>>>>><<<<<<<<<thssg")
        console.log(that.data_edit_kpi)
        that.dialogFormVisible = true
        console.log(that.dialogFormVisible)
        setTimeout(function () {
            $('#edit-import-kpi').modal('show');
            $('.modal-dialog .modal-body').attr('style', 'max-height:' + parseInt(screen.height * 0.6) + 'px !important; overflow-y: auto');
        }, 200)
    },
    resetErrorMsg: function(kpi){
        kpi.check_error_year = false;
        kpi.check_error_quarter_1 = false;
        kpi.check_error_quarter_2 = false;
        kpi.check_error_quarter_3 = false;
        kpi.check_error_quarter_4 = false;
    },
    confirm_edit_kpi: function (kpi) {
        var self = this;
        var kpi_validate = {}
        self.resetErrorMsg(kpi.data)
        kpi.data.msg = '';
        self.validate_kpi(kpi.data)
        setTimeout(function () {
            if (!$('.text-muted').length) {
                $("body.bg-sm").removeAttr("style");
                self.infor_msg_box.show_infor_msg = true;
                if(self.data_edit_kpi.data.msg){
                    self.infor_msg_box.type_msg = "error";
                    self.infor_msg_box.tite_msg = "Chỉnh sửa KPI không thành công"
                    self.infor_msg_box.array_msg.push("Chỉnh sửa nhập dữ liệu KPI không thành công !")
                }else{
                    $('#edit-import-kpi').modal('hide')
                    self.infor_msg_box.type_msg = "success";
                    self.infor_msg_box.tite_msg = "Chỉnh sửa KPI thành công"
                    self.infor_msg_box.array_msg.push("Chỉnh sửa nhập dữ liệu KPI thành công !")
                    self.$set(that.kpis, self.data_edit_kpi.data.index, self.data_edit_kpi.data);
                    setTimeout(function () {
                        self.infor_msg_box.show_infor_msg = false;
                    },2000)
                }

                return;
            }
        }, 1000)
        // Không cần thiết vì đã có filter xử lý việc này => tránh lỗi chuyển data kpi.score_calculation_type
        // qua tiếng việt rồi lại qua tiếng anh chỉ để show lên xem
        //
        // if(self.method.indexOf(kpi.data.score_calculation_type.trim().toLowerCase())!=-1)
        //     kpi.data.score_calculation_type = self.trans_method(kpi.data.score_calculation_type);

    },
    format_number_edit: function (keys, id) {
        if (isNaN(keys.key)) {
            data_edit_kpi.data[id] = data_edit_kpi.data[id].slice(0, -1);
        }
    },
    convertNewStructData: function(kpi){
        var data_import_kpi= {
            year_target: parseFloat(kpi.year) || null,
            q1: parseFloat(kpi.q1) || null,
            q2: parseFloat(kpi.q2) || null,
            q3: parseFloat(kpi.q3) || null,
            q4: parseFloat(kpi.q4) || null,
            check_goal: kpi.check_goal,
            goal: kpi.goal,
            kpi: kpi.kpi,
            kpi_id: kpi.kpi_id,
            unit: kpi.unit,
            measurement: kpi.measurement,
            score_calculation_type: kpi.score_calculation_type,
            operator: kpi.operator,
            weight: parseFloat(kpi.weight) || null,
            email: kpi.email,
            code: kpi.code,
            year_data: {
                months_target: {
                    quarter_1: {
                        month_1: parseFloat(kpi.t1) || null,
                        month_2: parseFloat(kpi.t2) || null,
                        month_3: parseFloat(kpi.t3) || null
                    },
                    quarter_2: {
                        month_1: parseFloat(kpi.t4) || null,
                        month_2: parseFloat(kpi.t5) || null,
                        month_3: parseFloat(kpi.t6) || null
                    },
                    quarter_3: {
                        month_1: parseFloat(kpi.t7) || null,
                        month_2: parseFloat(kpi.t8) || null,
                        month_3: parseFloat(kpi.t9) || null
                    },
                    quarter_4: {
                        month_1: parseFloat(kpi.t10) || null,
                        month_2: parseFloat(kpi.t11) || null,
                        month_3: parseFloat(kpi.t12) || null
                    }
                }
            }

        }
        return data_import_kpi
    },
    add_kpi: function (index) {
        var that = this;
        $('#error_modal').modal('hide');
        if (index == undefined) {
            return;
        }
        var kpi = that.kpis[index];

        kpi.status = "adding";
        if ((kpi.score_calculation_type.trim().toLowerCase() == ''
            || kpi.score_calculation_type.trim().toLowerCase() == 'most recent')
            && that.check_kpi_child(kpi.kpi_id))
            kpi.score_calculation_type = 'most_recent';
        that.$set(that.kpis, index, kpi);

        var p = that.method.indexOf(kpi.score_calculation_type.trim().toLowerCase());
        if (p > 2 && p <6){
            that.method_save = that.method[p-3];
        }
        else if( 0 <= p && p <= 2){
            that.method_save = that.method[p];
        }else {
            that.method_save = "";
        }
        kpi.score_calculation_type = that.method_save;
        var kpi_data_import = that.convertNewStructData(kpi)
        $('.add_kpi_' + index).button('loading')
        cloudjetRequest.ajax({
            type: "POST",
            url: "/api/kpis/import/add",
            data: JSON.stringify(kpi_data_import),
            success: function (data) {
                //console.log('yes, we can!');
                // router.push('/');
                kpi.status = "success";
                that.$set(that.kpis, index, kpi);
                kpi.score_calculation_type = that.method[p];
                $('.add_kpi_' + index).button('reset')
            },
            error: function (jqXHR) {
                //alert('failed');
                requestcenterHideNotification();
                var title_msg_error = "Thêm KPI thất bại"
                if (jqXHR.responseJSON){
                    if (jqXHR.responseJSON['exception']) {
                        var msg_error
                        Object.keys(jqXHR.responseJSON['exception']).forEach(function (key) {
                            msg_error =  key + ' : ' + jqXHR.responseJSON['exception'][key];
                            self.infor_msg_box.array_msg.push(msg_error)
                        });
                    }
                    // if(jqXHR.responseJSON['message']){
                    //     title_msg_error = jqXHR.responseJSON['message']
                    // }
                }
                self.infor_msg_box.show_infor_msg = true;
                self.infor_msg_box.type_msg = "error";
                self.infor_msg_box.tite_msg = title_msg_error
                try {
                    kpi.msg = jqXHR.responseJSON['message'];
                } catch (err) {
                }
                kpi.status = "failed";
                that.$set(that.kpis, index, kpi);
                $('.add_kpi_' + index).button('reset')
            },

            contentType: "application/json"

        });

    },
    add_all_kpi: function () {
        this.kpis.forEach(function (kpi, index) {
            if (kpi.status != 'success') {
                $('#add_kpi' + index).click();
            }
        })
    },
    //end example */
},
delimiters: ['${', '}$'],
    created: function () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.init()
}
,
watch: {
    // call again the method if the route changes
    '$route': 'init'
}
}
;


const routes = [
    {path: '/', component: Home},
//                {path: '/create-account', component: CreateAccount}
];

const router = new VueRouter({
    routes // short for routes: routes
});


const app = new Vue({
    router,

    delimiters: ['${', '}$']

}).$mount('#app');

function validate(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

