/**
 * Grass shader material for rendering animated instanced grass
 * Used in: GrassField component
 *
 * Adapted from "How to Make the Fluffiest Grass with Three.js" by Ebenezer
 * https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/
 * Original code: MIT License - Copyright (c) 2023 Ebenezer
 */
import * as THREE from "three";

interface GrassUniformsInterface {
	uTime?: { value: number };
	uEnableShadows?: { value: boolean };
	uShadowDarkness?: { value: number };
	uGrassLightIntensity?: { value: number };
	uNoiseScale?: { value: number };
	baseColor?: { value: THREE.Color };
	tipColor1?: { value: THREE.Color };
	tipColor2?: { value: THREE.Color };
	noiseTexture?: { value: THREE.Texture };
	grassAlphaTexture?: { value: THREE.Texture };
}

export class GrassMaterial {
	material: THREE.Material;

	private grassColorProps = {
		light: {
			baseColor: "#232e13",
			tipColor1: "#9bd38d",
			tipColor2: "#1f352a",
		},
		dark: {
			baseColor: "#1a2310",
			tipColor1: "#587a52",
			tipColor2: "#152218",
		},
	};

	uniforms: Record<string, { value: unknown }> = {
		uTime: { value: 0 },
		uEnableShadows: { value: true },
		uShadowDarkness: { value: 0.5 },
		uGrassLightIntensity: { value: 1 },
		uNoiseScale: { value: 4.0 },
		baseColor: { value: new THREE.Color(this.grassColorProps.light.baseColor) },
		tipColor1: { value: new THREE.Color(this.grassColorProps.light.tipColor1) },
		tipColor2: { value: new THREE.Color(this.grassColorProps.light.tipColor2) },
		noiseTexture: { value: new THREE.Texture() },
		grassAlphaTexture: { value: new THREE.Texture() },
	};

	/**
	 * Merges provided uniforms into existing uniforms
	 * Matches reference implementation behavior
	 */
	private mergeUniforms(newUniforms?: GrassUniformsInterface) {
		if (!newUniforms) return;
		for (const [key, value] of Object.entries(newUniforms)) {
			if (value && this.uniforms.hasOwnProperty(key) && this.uniforms[key]) {
				this.uniforms[key].value = value;
			}
		}
	}

	constructor(grassProps?: GrassUniformsInterface) {
		this.mergeUniforms(grassProps);
		this.material = new THREE.MeshLambertMaterial({
			side: THREE.DoubleSide,
			color: 0x229944,
			transparent: true,
			alphaTest: 0.1,
			shadowSide: 1,
		});

		this.setupGrassMaterial(this.material);
	}

	public updateGrassGraphicsChange(high = true) {
		const shadowUniform = this.uniforms.uEnableShadows;
		if (shadowUniform) {
			shadowUniform.value = high;
		}
	}

	public setDarkMode(isDark: boolean) {
		const colors = isDark ? this.grassColorProps.dark : this.grassColorProps.light;
		const baseUniform = this.uniforms.baseColor;
		const tip1Uniform = this.uniforms.tipColor1;
		const tip2Uniform = this.uniforms.tipColor2;
		if (baseUniform) (baseUniform.value as THREE.Color).set(colors.baseColor);
		if (tip1Uniform) (tip1Uniform.value as THREE.Color).set(colors.tipColor1);
		if (tip2Uniform) (tip2Uniform.value as THREE.Color).set(colors.tipColor2);
	}

	update(delta: number) {
		const timeUniform = this.uniforms.uTime;
		if (timeUniform) {
			timeUniform.value = delta;
		}
	}

	private setupGrassMaterial(material: THREE.Material) {
		material.onBeforeCompile = (shader) => {
			// Exact reference implementation - direct uniform assignment
			// Type assertions needed for TypeScript compatibility
			shader.uniforms = {
				...shader.uniforms,
				uTime: this.uniforms.uTime as THREE.IUniform,
				uTipColor1: this.uniforms.tipColor1 as THREE.IUniform,
				uTipColor2: this.uniforms.tipColor2 as THREE.IUniform,
				uBaseColor: this.uniforms.baseColor as THREE.IUniform,
				uEnableShadows: this.uniforms.uEnableShadows as THREE.IUniform,
				uShadowDarkness: this.uniforms.uShadowDarkness as THREE.IUniform,
				uGrassLightIntensity: this.uniforms.uGrassLightIntensity as THREE.IUniform,
				uNoiseScale: this.uniforms.uNoiseScale as THREE.IUniform,
				uNoiseTexture: this.uniforms.noiseTexture as THREE.IUniform,
				uGrassAlphaTexture: this.uniforms.grassAlphaTexture as THREE.IUniform,
			};

			shader.vertexShader = `
      // FOG
      #include <common>
      #include <fog_pars_vertex>
      // FOG
      #include <shadowmap_pars_vertex>
      uniform sampler2D uNoiseTexture;
      uniform float uNoiseScale;
      uniform float uTime;
      
      varying vec3 vColor;
      varying vec2 vGlobalUV;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vWindColor;
      void main() {
        #include <color_vertex>

        // Normals with instancing support
        #include <beginnormal_vertex>
        #include <defaultnormal_vertex>

        // wind effect
        vec2 uWindDirection = vec2(1.0,1.0);
        float uWindAmp = 0.1;
        float uWindFreq = 50.;
        float uSpeed = 1.0;
        float uNoiseFactor = 5.50;
        float uNoiseSpeed = 0.001;

        vec2 windDirection = normalize(uWindDirection); // Normalize the wind direction
        vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);

        float terrainSize = 100.;
        vGlobalUV = (terrainSize-vec2(modelPosition.xz))/terrainSize;

        vec4 noise = texture2D(uNoiseTexture,vGlobalUV+uTime*uNoiseSpeed);

        float sinWave = sin(uWindFreq*dot(windDirection, vGlobalUV) + noise.g*uNoiseFactor + uTime * uSpeed) * uWindAmp * (1.-uv.y);

        float xDisp = sinWave;
        float zDisp = sinWave;
        modelPosition.x += xDisp;
        modelPosition.z += zDisp;

        // use perlinNoise to vary the terrainHeight of the grass
        modelPosition.y += exp(texture2D(uNoiseTexture,vGlobalUV * uNoiseScale).r) * 0.5 * (1.-uv.y);

        vec4 worldPosition = modelPosition;
        vec4 mvPosition = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * mvPosition;

        // assign varyings
        vUv = vec2(uv.x,1.-uv.y);
        vNormal = normalize(normalMatrix * normal);
        vWindColor = vec2(xDisp,zDisp);
        vViewPosition = mvPosition.xyz;

        // SHADOW
        #include <shadowmap_vertex>
        // FOG
        #include <fog_vertex>
      }
      `;

			shader.fragmentShader = `
      #include <alphatest_pars_fragment>
      #include <alphamap_pars_fragment>
      // FOG
      #include <fog_pars_fragment>
      // FOG

      #include <common>
      #include <packing>
      #include <lights_pars_begin>
      #include <shadowmap_pars_fragment>
      #include <shadowmask_pars_fragment>
      
      uniform float uTime;
      uniform vec3 uBaseColor;
      uniform vec3 uTipColor1;
      uniform vec3 uTipColor2;
      uniform sampler2D uGrassAlphaTexture;
      uniform sampler2D uNoiseTexture;
      uniform float uNoiseScale;
      uniform int uEnableShadows;
      
      uniform float uGrassLightIntensity;
      uniform float uShadowDarkness;
      varying vec3 vColor;
      
      varying vec2 vUv;
      varying vec2 vGlobalUV;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vWindColor;
      
      void main() {
        vec4 grassAlpha = texture2D(uGrassAlphaTexture,vUv);

        vec4 grassVariation = texture2D(uNoiseTexture, vGlobalUV * uNoiseScale);
        vec3 tipColor = mix(uTipColor1,uTipColor2,grassVariation.r);
        
        vec4 diffuseColor = vec4( mix(uBaseColor,tipColor,vUv.y), step(0.1,grassAlpha.r) );
        vec3 grassFinalColor = diffuseColor.rgb * uGrassLightIntensity;
        
        // light calculation derived from <lights_fragment_begin>
        vec3 geometryPosition = vViewPosition;
        vec3 geometryNormal = vNormal;
        vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
        vec3 geometryClearcoatNormal;
          IncidentLight directLight;
          float shadow = 0.0;
          float currentShadow = 0.0;
          float NdotL;
          if(uEnableShadows == 1){
            #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
              shadow = getShadowMask();
            #else
              shadow = 1.0;
            #endif
            grassFinalColor = mix(grassFinalColor , grassFinalColor * uShadowDarkness,  1.-shadow) ;
          } else{
            shadow = 1.0;
            grassFinalColor = grassFinalColor ;
          }
        diffuseColor.rgb = clamp(diffuseColor.rgb*shadow,0.0,1.0);

        #include <alphatest_fragment>
        gl_FragColor = vec4(grassFinalColor ,1.0);

        // uncomment to visualize wind
        // vec3 windColorViz = vec3((vWindColor.x+vWindColor.y)/2.);
        // gl_FragColor = vec4(windColorViz,1.0);
        
        #include <tonemapping_fragment>
        #include <colorspace_fragment>

        // FOG
        #include <fog_fragment>
      }
    `;
		};
	}

	setupTextures(grassAlphaTexture: THREE.Texture, noiseTexture: THREE.Texture) {
		const alphaUniform = this.uniforms.grassAlphaTexture;
		const noiseUniform = this.uniforms.noiseTexture;
		if (alphaUniform) alphaUniform.value = grassAlphaTexture;
		if (noiseUniform) noiseUniform.value = noiseTexture;
	}
}

