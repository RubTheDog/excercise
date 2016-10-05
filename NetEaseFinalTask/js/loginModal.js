//登录弹窗组件,兼容ie8并实现placeholder
(function(_) {

    var template = '<div class="m-mask">\
        <div class="g-align"></div>\
        <form class="g-align m-login">\
            <span id="login-close">×</span>\
            <h2></h2>\
            <input type="text" id="userName">\
            <input type="password" id="password">\
            <p class="s-invalid"></p>\
            <button type="submit" id="login-submit">登录</button>\
        </form>\
    </div>';

    function LoginModal(options) {
        if (options) _.extend(this, options);

        //获取相关节点
        this.container = this.container || document.body;
        this.loginModal = this._layout.cloneNode(true);
        this.form = this.loginModal.querySelector('form');
        this.title = this.loginModal.querySelector('h2');
        this.close = this.loginModal.querySelector('#login-close');
        this._userName = this.loginModal.querySelector('#userName');
        this._password = this.loginModal.querySelector('#password');
        this.invalidHint = this.loginModal.querySelector('p');
        this.loginbtn = this.loginModal.querySelector('#login-submit');

        //提供自定义内容默认值
        this.titleName = this.titleName || '登录';
        this.placeholder = this.placeholder || { //设置placeholder显示的字，预防产品死抠字眼
            userName: '用户名',
            password: '密码'
        };
        this.pattern = this.pattern || {
            userName: '^\\S{5,12}$',
            password: '^\\S{6,20}$'
        };

        this._init();

        this.container.appendChild(this.loginModal);
    }
    _.extend(LoginModal.prototype, _.emitter);
    _.extend(LoginModal.prototype, {
        //模板转换为节点
        _layout: _.html2node(template),

        //初始化操作
        _init: function() {
            //设置相关属性
            this.form.action = this.action;
            this.form.method = this.method;
            this.title.innerText = this.titleName;
            this._setPlaceHolder(this._userName, this.placeholder.userName);
            this._setPlaceHolder(this._password, this.placeholder.password);

            //添加事件监听
            addEvent(this.close, 'click', this._close.bind(this));
            addEvent(this.form, 'submit', this._login.bind(this));
            addEvent(this._userName, 'blur', this._blur.bind(this, 'userName'));
            addEvent(this._password, 'blur', this._blur.bind(this, 'password'));
            addEvent(this._userName, 'focus', this._focus.bind(this, 'userName'));
            addEvent(this._password, 'focus', this._focus.bind(this, 'password'));
        },

        //关闭登录Modal
        _close: function() {
            this.container.removeChild(this.loginModal);
        },

        //设置placeholder内容
        _setPlaceHolder: function(node, holderText) {
            if ('placeholder' in node) { //优先使用placeholder
                node.placeholder = holderText;
            } else { //模拟placeholder,ie8不能修改input.type,所以被迫单独创建一个input用于显示~
                node.style.display = 'none';
                var holderInput = this.form.querySelector('.holder.' + node.id);
                if (!holderInput) holderInput = document.createElement('input');

                //设置内容及样式
                holderInput.value = holderText;
                holderInput.style.display = 'block';
                _.addClass(holderInput, 'holder'); //添加holder样式
                _.addClass(holderInput, node.id); //添加node.id作为类名保证唯一性

                //添加到表单中
                this.form.insertBefore(holderInput, node);

                //添加事件监听隐藏holder
                addEvent(holderInput, 'focus', function() {
                    holderInput.style.display = 'none'; //隐藏holder输入框
                    node.style.display = 'block'; //聚焦回原输入框
                    node.select();
                }.bind(node, holderInput));
            }
        },

        //用户名验证，返回true即为验证通过
        _userNameValidity: function() {
            if (new RegExp(this.pattern.userName).test(this._userName.value)) return true;
            if (this._userName.value === '') this.invalidHint.innerText = '请输入您的账号';
            else this.invalidHint.innerText = '用户名必须为5-12位';
            this.invalidType = 'userName';
            return false;
        },

        //密码验证，返回true即为验证通过  
        _passwordValidity: function() {
            if (new RegExp(this.pattern.password).test(this._password.value)) return true;
            if (this._password.value === '') this.invalidHint.innerText = '请输入您的密码';
            else this.invalidHint.innerText = '密码为8-16位，必须包含字母和数字';
            this.invalidType = 'password';
            return false;
        },

        //输入框失焦事件
        _blur: function(name) {
            if (this['_' + name].value === '') this._setPlaceHolder(this['_' + name], this.placeholder[name]);
            this['_' + name + 'Validity']();
        },

        //输入框获取焦点事件
        _focus: function(name) {
            if (this.invalidType === name || this.invalidType === 'loginFailed') this.invalidHint.innerText = '';
        },

        //获取md5加密参数
        _getOptions: function() {
            return {
                userName: hex_md5(this._userName.value),
                password: hex_md5(this._password.value)
            };
        },

        //登录回调
        _callback: function(responseText) {
            if (responseText == 1) {
                this.sucCallback && this.sucCallback();
                this._close(); //登录成功，关闭弹窗
            } else {
                this.failCallback && this.failCallback();
                this.invalidHint.innerText = '用户名或密码错误，请重新输入';
                this.invalidType = 'loginFailed';
                this.loginbtn.disabled = false; //恢复submit按钮
            }
        },

        //提交事件
        _login: function(event) {
            event = event || window.event;
            if (event.preventDefault) event.preventDefault(); //取消表单默认提交
            else event.returnValue = false;
            if (this._userNameValidity() && this._passwordValidity()) { //表单验证通过即发送ajax请求
                this.loginbtn.disabled = true; //禁用按钮防止重复提交
                if (this.form.method === 'post') _.ajax.post(this.form.action, this._getOptions(), this._callback.bind(this));
                else _.ajax.get(this.form.action, this._getOptions(), this._callback.bind(this)); //默认为get提交方式
            }
        }
    });

    //暴露至全局
    window.LoginModal = LoginModal;
}(utils));