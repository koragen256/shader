// sample_068
//
// GLSL だけでレンダリングする

// GLSL サンプルの(ほぼ)共通仕様 =============================================
// 
// ・シェーダのコンパイルに失敗した場合は auto run を無効にします
// ・auto run は 30fps になっているので環境と負荷に応じて適宜変更しましょう
// ・uniform 変数は以下のようにシェーダへ送られます 
//     ・time: 経過時間を秒単位(ミリ秒は小数点以下)で送る(float)
//     ・mouse: マウス座標を canvas 左上原点で 0 ～ 1 の範囲で送る(vec2)
//     ・resolution: スクリーンの縦横の幅をピクセル単位で送る(vec2)
// ・シェーダのコンパイルに失敗した場合エラー内容をアラートとコンソールに出力
// ・シェーダのエラーで表示される行番号は一致するように HTML を書いてあります
// 
// ============================================================================

// global
var c, cw, ch, mx, my, gl, run, eCheck;
var startTime;
var time = 0.0;
var tempTime = 0.0;
var fps = 1000 / 60;
var uniLocation = new Array();

window.onload = function(){
	c = document.getElementById('canvas');
	cw = window.innerWidth; ch = window.innerHeight;
	c.width = cw; c.height = ch;
	c.addEventListener('mousemove', mouseMove, true);
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	
	var prg = create_program(create_shader('vs'), create_shader('fs'));
	run = (prg != null); if(!run){eCheck.checked = false;}
	uniLocation[0] = gl.getUniformLocation(prg, 'time');
	uniLocation[1] = gl.getUniformLocation(prg, 'mouse');
	uniLocation[2] = gl.getUniformLocation(prg, 'resolution');
	
	var position = [
		-1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	var index = [
		0, 2, 1,
		1, 2, 3
	];
	var vPosition = create_vbo(position);
	var vIndex = create_ibo(index);
	var vAttLocation = gl.getAttribLocation(prg, 'position');
	gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
	gl.enableVertexAttribArray(vAttLocation);
	gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	mx = 0.5; my = 0.5;
	startTime = new Date().getTime();

	render();
};

window.addEventListener('resize', function() {
    c = document.getElementById('canvas');
	cw = window.innerWidth; ch = window.innerHeight;
	c.width = cw; c.height = ch;
});

// checkbox
function checkChange(e){
	run = e.currentTarget.checked;
	if(run){
		startTime = new Date().getTime();
		render();
	}else{
		tempTime += time;
	}
}

function mouseMove(e){
	mx = e.offsetX / cw;
	my = e.offsetY / ch;
}

function render(){
	if(!run){return;}

	time = (new Date().getTime() - startTime) * 0.001;
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.uniform1f(uniLocation[0], time + tempTime);
	gl.uniform2fv(uniLocation[1], [mx, my]);
	gl.uniform2fv(uniLocation[2], [cw, ch]);
	
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	gl.flush();
	setTimeout(render, fps);
}

// シェーダを生成する関数
function create_shader(id){
	var shader;
	var scriptElement = document.getElementById(id);
	if(!scriptElement){return;}
	
	switch(scriptElement.type){
		case 'x-shader/x-vertex':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
		case 'x-shader/x-fragment':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default :
			return;
	}
	
	gl.shaderSource(shader, scriptElement.text);
	
	gl.compileShader(shader);
	
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		return shader;
	}else{
		
		alert(gl.getShaderInfoLog(shader));
		console.log(gl.getShaderInfoLog(shader));
	}
}

// プログラムオブジェクトを生成しシェーダをリンクする関数
function create_program(vs, fs){
	// プログラムオブジェクトの生成
	var program = gl.createProgram();
	
	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	
	// シェーダをリンク
	gl.linkProgram(program);
	
	// シェーダのリンクが正しく行なわれたかチェック
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
	
		// 成功していたらプログラムオブジェクトを有効にする
		gl.useProgram(program);
		
		// プログラムオブジェクトを返して終了
		return program;
	}else{
		
		// 失敗していたら NULL を返す
		return null;
	}
}

// VBOを生成する関数
function create_vbo(data){
	// バッファオブジェクトの生成
	var vbo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// 生成した VBO を返して終了
	return vbo;
}

// IBOを生成する関数
function create_ibo(data){
	// バッファオブジェクトの生成
	var ibo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	// 生成したIBOを返して終了
	return ibo;
}
